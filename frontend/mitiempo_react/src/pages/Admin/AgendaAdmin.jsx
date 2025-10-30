<<<<<<< HEAD
// src/pages/Admin/AgendaAdmin.jsx
=======
// front/src/pages/Admin/AgendaAdmin.jsx
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
<<<<<<< HEAD
import interactionPlugin from '@fullcalendar/interaction'; // Para clicks
=======
import interactionPlugin from '@fullcalendar/interaction';
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
import toast from 'react-hot-toast';

import { getTurnos, deleteTurno, updateTurno } from '../../api/turnos';
import Modal from '../../components/Common/Modal';
<<<<<<< HEAD
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; // Componente de solo lectura
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; // Formulario de Cread/Edición

// --- Estilos CSS (integrados al final del archivo) ---
import "../../CSS/AdminAgenda.css"; 
// ----------------------------------------------------
=======
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; 
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; 

// 💡 Importamos el CSS rediseñado
import "../../CSS/AdminAgenda.css"; 

// 🎨 --- COLORES ACTUALIZADOS --- 
// Colores más elegantes y alineados con el nuevo tema.
const ESTADO_COLORS = {
  'pendiente': '#f59e0b', // Ámbar (para advertencia)
  'confirmado': '#059669', // Verde (éxito)
  'completado': '#3b82f6', // Azul (informativo)
  'cancelado': '#777777',  // Gris (color secundario de texto)
};
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)

export default function AgendaAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // --- Estado de Modales ---
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
<<<<<<< HEAD
  const [selectedTurno, setSelectedTurno] = useState(null); // Objeto de turno completo
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); // Solo ID
  
  // --- Carga inicial de turnos ---
=======
  const [selectedTurno, setSelectedTurno] = useState(null); 
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); 
  
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = () => {
    setLoading(true);
<<<<<<< HEAD
    getTurnos() // El backend ya filtra por rol (admin/empleado)
      .then(response => {
        // Tu serializer de Django ya prepara los datos para FullCalendar
        const calendarEvents = response.data.map(turno => ({
          ...turno,
          id: turno.id_turno, // FullCalendar usa 'id'
=======
    getTurnos() 
      .then(response => {
        
        const calendarEvents = response.data.map(turno => ({
          id: turno.id_turno,
          title: turno.cliente_nombre, 
          start: turno.fecha_hora_inicio, 
          end: turno.fecha_hora_fin, 
          backgroundColor: ESTADO_COLORS[turno.estado] || '#777',
          borderColor: ESTADO_COLORS[turno.estado] || '#777',
          textColor: '#ffffff', // 🎨 Aseguramos texto blanco en eventos
          extendedProps: { ...turno } 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
        }));
        
        setEvents(calendarEvents);
      })
      .catch(err => toast.error("Error al cargar la agenda."))
      .finally(() => setLoading(false));
  };

<<<<<<< HEAD
  // --- Handlers de Interacción del Calendario ---

  // Al hacer clic en un evento (turno) existente
  const handleEventClick = (clickInfo) => {
    const turnoId = clickInfo.event.id;
    const turnoCompleto = events.find(e => e.id_turno == turnoId);
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
      setViewModalOpen(true); // Abre el modal de VISTA
=======
  // --- El resto de los manejadores (sin cambios) ---

  const handleEventClick = (clickInfo) => {
    const turnoCompleto = clickInfo.event.extendedProps;
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
      setViewModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    }
  };

  // Al hacer clic en un día vacío
  const handleDateClick = (arg) => {
<<<<<<< HEAD
    setSelectedTurnoId(null); // Modo "Crear"
    setFormModalOpen(true); // Abre el modal de FORMULARIO
    // Opcional: pasar la fecha
    // setInitialDate(arg.dateStr); 
  };
  
  // --- Handlers de Acciones del Modal ---

=======
    setSelectedTurnoId(null); 
    setFormModalOpen(true); 
  };
  
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTurno(null);
  };
  
<<<<<<< HEAD
  // Cierra el formulario (el form llama a esto con 'true' si guardó)
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  const handleCloseFormModal = (didSave = false) => {
    setFormModalOpen(false);
    setSelectedTurnoId(null);
    if (didSave) {
<<<<<<< HEAD
      loadTurnos(); // Recarga la agenda si se guardó
=======
      loadTurnos(); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    }
  };

  // Cuando el modal de VISTA presiona "Editar"
  const handleEditFromView = () => {
<<<<<<< HEAD
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
=======
    setSelectedTurnoId(selectedTurno.id_turno);
    setViewModalOpen(false); 
    setFormModalOpen(true); 
  };

  const handleUpdateStatus = async (nuevoEstado) => {
    if (!selectedTurno) return;
    setLoading(true);
    
    try {
      await updateTurno(selectedTurno.id_turno, { estado: nuevoEstado });
      toast.success(`Turno ${nuevoEstado}`);
      loadTurnos(); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    } catch (err) {
      toast.error("Error al actualizar estado.");
    } finally {
      setLoading(false);
      handleCloseViewModal();
    }
  };

  // Cuando el modal de VISTA presiona "Eliminar"
  const handleDeleteRequest = () => {
<<<<<<< HEAD
    setSelectedTurnoId(selectedTurno.id_turno); // Guarda el ID a borrar
    setViewModalOpen(false); // Cierra modal de vista
    setDeleteModalOpen(true); // Abre modal de confirmación
=======
    setSelectedTurnoId(selectedTurno.id_turno);
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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

<<<<<<< HEAD
  return (
    <div className="admin-page-container admin-agenda">
      {loading && <p>Cargando agenda...</p>}

      <div className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" // Vista semanal
=======
  // --- Renderizado ---

  return (
    // 💡 Contenedor genérico. El layout ya da el padding.
    <div className="admin-agenda"> 
      {loading && (
        <div className="loading-spinner">Cargando agenda...</div>
      )}

      {/* 🎨 Contenedor de la tarjeta del calendario */}
      <div className="calendar-container card">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek" 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
<<<<<<< HEAD
          events={events}
          eventClick={handleEventClick} // Abrir modal de vista
          dateClick={handleDateClick} // Abrir modal de creación
          editable={false} // Deshabilitamos drag-and-drop
          selectable={true}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
=======
          events={events} 
          eventClick={handleEventClick} 
          dateClick={handleDateClick} 
          editable={false} 
          selectable={true}
          allDaySlot={false}
          slotMinTime="08:00:00" 
          slotMaxTime="20:00:00" 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
<<<<<<< HEAD
          height="auto" // Ajusta altura al contenedor
        />
      </div>

      {/* --- Modales --- */}

      {/* Modal de Vista (Solo Lectura) */}
=======
          height="auto" // Se ajusta al contenedor
          // 💡 Propiedades para zona horaria y formato
          timeZone="local" 
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false
          }}
        />
      </div>

      {/* --- Modales (usando el nuevo estilo de index.css y App.css) --- */}

>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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
      
<<<<<<< HEAD
      {/* Modal de Formulario (Crear/Editar) */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      {formModalOpen && (
        <TurnoFormAdmin
          turnoIdToEdit={selectedTurnoId}
          onClose={handleCloseFormModal}
        />
      )}
      
<<<<<<< HEAD
      {/* Modal de Confirmar Eliminación */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
<<<<<<< HEAD
=======
            {/* 🎨 Clases de botones del nuevo sistema de diseño */}
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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