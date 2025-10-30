// src/pages/Admin/AgendaAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Para clicks
import toast from 'react-hot-toast';

import { getTurnos, deleteTurno, updateTurno } from '../../api/turnos';
import Modal from '../../components/Common/Modal';
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; // Componente de solo lectura
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; // Formulario de Cread/Edición

// --- Estilos CSS (integrados al final del archivo) ---
import "../../CSS/AdminAgenda.css"; 
// ----------------------------------------------------

export default function AgendaAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // --- Estado de Modales ---
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedTurno, setSelectedTurno] = useState(null); // Objeto de turno completo
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); // Solo ID
  
  // --- Carga inicial de turnos ---
  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = () => {
    setLoading(true);
    getTurnos() // El backend ya filtra por rol (admin/empleado)
      .then(response => {
        // Tu serializer de Django ya prepara los datos para FullCalendar
        const calendarEvents = response.data.map(turno => ({
          ...turno,
          id: turno.id_turno, // FullCalendar usa 'id'
        }));
        setEvents(calendarEvents);
      })
      .catch(err => toast.error("Error al cargar la agenda."))
      .finally(() => setLoading(false));
  };

  // --- Handlers de Interacción del Calendario ---

  // Al hacer clic en un evento (turno) existente
  const handleEventClick = (clickInfo) => {
    const turnoId = clickInfo.event.id;
    const turnoCompleto = events.find(e => e.id_turno == turnoId);
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
      setViewModalOpen(true); // Abre el modal de VISTA
    }
  };

  // Al hacer clic en un día vacío
  const handleDateClick = (arg) => {
    setSelectedTurnoId(null); // Modo "Crear"
    setFormModalOpen(true); // Abre el modal de FORMULARIO
    // Opcional: pasar la fecha
    // setInitialDate(arg.dateStr); 
  };
  
  // --- Handlers de Acciones del Modal ---

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTurno(null);
  };
  
  // Cierra el formulario (el form llama a esto con 'true' si guardó)
  const handleCloseFormModal = (didSave = false) => {
    setFormModalOpen(false);
    setSelectedTurnoId(null);
    if (didSave) {
      loadTurnos(); // Recarga la agenda si se guardó
    }
  };

  // Cuando el modal de VISTA presiona "Editar"
  const handleEditFromView = () => {
    setSelectedTurnoId(selectedTurno.id_turno); // Pasa el ID al formulario
    setViewModalOpen(false); // Cierra modal de vista
    setFormModalOpen(true); // Abre modal de formulario
  };

  // Cuando el modal de VISTA presiona "Confirmar" o "Cancelar"
  const handleUpdateStatus = async (nuevoEstado) => {
    if (!selectedTurno) return;
    setLoading(true);
    try {
      await updateTurno(selectedTurno.id_turno, { estado_turno: nuevoEstado });
      toast.success(`Turno ${nuevoEstado}`);
      loadTurnos(); // Recarga
    } catch (err) {
      toast.error("Error al actualizar estado.");
    } finally {
      setLoading(false);
      handleCloseViewModal();
    }
  };

  // Cuando el modal de VISTA presiona "Eliminar"
  const handleDeleteRequest = () => {
    setSelectedTurnoId(selectedTurno.id_turno); // Guarda el ID a borrar
    setViewModalOpen(false); // Cierra modal de vista
    setDeleteModalOpen(true); // Abre modal de confirmación
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedTurnoId) return;
    setLoading(true);
    try {
      await deleteTurno(selectedTurnoId);
      toast.success("Turno eliminado.");
      loadTurnos();
    } catch (err) {
      toast.error("Error al eliminar el turno.");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSelectedTurnoId(null);
    }
  };

  return (
    <div className="admin-page-container admin-agenda">
      {loading && <p>Cargando agenda...</p>}

      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" // Vista semanal
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick} // Abrir modal de vista
          dateClick={handleDateClick} // Abrir modal de creación
          editable={false} // Deshabilitamos drag-and-drop
          selectable={true}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
          height="auto" // Ajusta altura al contenedor
        />
      </div>

      {/* --- Modales --- */}

      {/* Modal de Vista (Solo Lectura) */}
      {viewModalOpen && (
        <TurnoDetailModal
          turno={selectedTurno}
          onClose={handleCloseViewModal}
          onEdit={handleEditFromView}
          onDelete={handleDeleteRequest}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />
      )}
      
      {/* Modal de Formulario (Crear/Editar) */}
      {formModalOpen && (
        <TurnoFormAdmin
          turnoIdToEdit={selectedTurnoId}
          onClose={handleCloseFormModal}
        />
      )}
      
      {/* Modal de Confirmar Eliminación */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary" disabled={loading}>Cancelar</button>
            <button onClick={handleDeleteConfirm} className="btn btn-danger" disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar Turno"}
            </button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer.</p>
      </Modal>

    </div>
  );
}