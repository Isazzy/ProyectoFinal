import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast from 'react-hot-toast';

import { getTurnos, deleteTurno, updateTurno } from '../../api/turnos';
import Modal from '../../components/Common/Modal';
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; 
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; 

import "../../CSS/AdminAgenda.css"; 

const ESTADO_COLORS = {
  'pendiente': '#f0ad4e', 
  'confirmado': '#5cb85c', 
  'completado': '#5bc0de', 
  'cancelado': '#d9534f',  
};

export default function AgendaAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const [selectedTurno, setSelectedTurno] = useState(null); 
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); 
  
  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = () => {
    setLoading(true);
    getTurnos() 
      .then(response => {
        
        const calendarEvents = response.data.map(turno => ({
          id: turno.id_turno, // <- Corregido para usar id_turno
          title: turno.cliente_nombre, 
          start: turno.fecha_hora_inicio, 
          end: turno.fecha_hora_fin, 
          backgroundColor: ESTADO_COLORS[turno.estado] || '#777',
          borderColor: ESTADO_COLORS[turno.estado] || '#777',
          extendedProps: { ...turno } 
        }));
        
        setEvents(calendarEvents);
      })
      .catch(err => toast.error("Error al cargar la agenda."))
      .finally(() => setLoading(false));
  };

  const handleEventClick = (clickInfo) => {
    const turnoCompleto = clickInfo.event.extendedProps;
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
      setViewModalOpen(true); 
    }
  };

  const handleDateClick = (arg) => {
    setSelectedTurnoId(null); 
    setFormModalOpen(true); 
  };
  
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTurno(null);
  };
  
  const handleCloseFormModal = (didSave = false) => {
    setFormModalOpen(false);
    setSelectedTurnoId(null);
    if (didSave) {
      loadTurnos(); 
    }
  };

  const handleEditFromView = () => {
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
    setViewModalOpen(false); 
    setFormModalOpen(true); 
  };

  const handleUpdateStatus = async (nuevoEstado) => {
    if (!selectedTurno) return;
    setLoading(true);
    
    try {
      await updateTurno(selectedTurno.id_turno, { estado: nuevoEstado }); // <- Corregido para usar id_turno
      toast.success(`Turno ${nuevoEstado}`);
      loadTurnos(); 
    } catch (err) {
      toast.error("Error al actualizar estado.");
    } finally {
      setLoading(false);
      handleCloseViewModal();
    }
  };

  const handleDeleteRequest = () => {
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
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
          initialView="timeGridWeek" 
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events} 
          eventClick={handleEventClick} 
          dateClick={handleDateClick} 
          editable={false} 
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
          height="auto" 
        />
      </div>

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
      
      {formModalOpen && (
        <TurnoFormAdmin
          turnoIdToEdit={selectedTurnoId}
          onClose={handleCloseFormModal}
        />
      )}
      
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