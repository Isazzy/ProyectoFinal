<<<<<<< HEAD
<<<<<<< HEAD
// src/pages/Admin/AgendaAdmin.jsx
=======
// front/src/pages/Admin/AgendaAdmin.jsx
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
<<<<<<< HEAD
<<<<<<< HEAD
import interactionPlugin from '@fullcalendar/interaction'; // Para clicks
=======
import interactionPlugin from '@fullcalendar/interaction';
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
import interactionPlugin from '@fullcalendar/interaction';
>>>>>>> 67ec8a26 (Producto terminado (Creo))
import toast from 'react-hot-toast';

import { getTurnos, deleteTurno, updateTurno } from '../../api/turnos';
import Modal from '../../components/Common/Modal';
<<<<<<< HEAD
<<<<<<< HEAD
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; // Componente de solo lectura
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; // Formulario de Cread/Edición
=======
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal'; 
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin'; 
>>>>>>> 67ec8a26 (Producto terminado (Creo))

import "../../CSS/AdminAgenda.css"; 
<<<<<<< HEAD
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
=======

const ESTADO_COLORS = {
  'pendiente': '#f0ad4e', 
  'confirmado': '#5cb85c', 
  'completado': '#5bc0de', 
  'cancelado': '#d9534f',  
};
>>>>>>> 67ec8a26 (Producto terminado (Creo))

export default function AgendaAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
<<<<<<< HEAD
<<<<<<< HEAD
  const [selectedTurno, setSelectedTurno] = useState(null); // Objeto de turno completo
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); // Solo ID
  
  // --- Carga inicial de turnos ---
=======
  const [selectedTurno, setSelectedTurno] = useState(null); 
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); 
  
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
  const [selectedTurno, setSelectedTurno] = useState(null); 
  const [selectedTurnoId, setSelectedTurnoId] = useState(null); 
  
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = () => {
    setLoading(true);
<<<<<<< HEAD
<<<<<<< HEAD
    getTurnos() // El backend ya filtra por rol (admin/empleado)
=======
    getTurnos() 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
      .then(response => {
        
        const calendarEvents = response.data.map(turno => ({
<<<<<<< HEAD
          ...turno,
          id: turno.id_turno, // FullCalendar usa 'id'
=======
    getTurnos() 
      .then(response => {
        
        const calendarEvents = response.data.map(turno => ({
          id: turno.id_turno,
=======
          id: turno.id_turno, // <- Corregido para usar id_turno
>>>>>>> 67ec8a26 (Producto terminado (Creo))
          title: turno.cliente_nombre, 
          start: turno.fecha_hora_inicio, 
          end: turno.fecha_hora_fin, 
          backgroundColor: ESTADO_COLORS[turno.estado] || '#777',
          borderColor: ESTADO_COLORS[turno.estado] || '#777',
<<<<<<< HEAD
          textColor: '#ffffff', // 🎨 Aseguramos texto blanco en eventos
          extendedProps: { ...turno } 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
          extendedProps: { ...turno } 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
        }));
        
        setEvents(calendarEvents);
      })
      .catch(err => toast.error("Error al cargar la agenda."))
      .finally(() => setLoading(false));
  };

<<<<<<< HEAD
<<<<<<< HEAD
  // --- Handlers de Interacción del Calendario ---

  // Al hacer clic en un evento (turno) existente
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  const handleEventClick = (clickInfo) => {
    const turnoCompleto = clickInfo.event.extendedProps;
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
<<<<<<< HEAD
      setViewModalOpen(true); // Abre el modal de VISTA
=======
  // --- El resto de los manejadores (sin cambios) ---

  const handleEventClick = (clickInfo) => {
    const turnoCompleto = clickInfo.event.extendedProps;
    
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
      setViewModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
      setViewModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    }
  };

  const handleDateClick = (arg) => {
<<<<<<< HEAD
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
=======
    setSelectedTurnoId(null); 
    setFormModalOpen(true); 
  };
  
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTurno(null);
  };
  
<<<<<<< HEAD
<<<<<<< HEAD
  // Cierra el formulario (el form llama a esto con 'true' si guardó)
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  const handleCloseFormModal = (didSave = false) => {
    setFormModalOpen(false);
    setSelectedTurnoId(null);
    if (didSave) {
<<<<<<< HEAD
<<<<<<< HEAD
      loadTurnos(); // Recarga la agenda si se guardó
=======
      loadTurnos(); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
      loadTurnos(); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    }
  };

  const handleEditFromView = () => {
<<<<<<< HEAD
<<<<<<< HEAD
    setSelectedTurnoId(selectedTurno.id_turno); // Pasa el ID al formulario
    setViewModalOpen(false); // Cierra modal de vista
    setFormModalOpen(true); // Abre modal de formulario
=======
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
    setViewModalOpen(false); 
    setFormModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  };

  const handleUpdateStatus = async (nuevoEstado) => {
    if (!selectedTurno) return;
    setLoading(true);
    
    try {
      await updateTurno(selectedTurno.id_turno, { estado: nuevoEstado }); // <- Corregido para usar id_turno
      toast.success(`Turno ${nuevoEstado}`);
<<<<<<< HEAD
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
=======
      loadTurnos(); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    } catch (err) {
      toast.error("Error al actualizar estado.");
    } finally {
      setLoading(false);
      handleCloseViewModal();
    }
  };

  const handleDeleteRequest = () => {
<<<<<<< HEAD
<<<<<<< HEAD
    setSelectedTurnoId(selectedTurno.id_turno); // Guarda el ID a borrar
    setViewModalOpen(false); // Cierra modal de vista
    setDeleteModalOpen(true); // Abre modal de confirmación
=======
    setSelectedTurnoId(selectedTurno.id_turno);
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
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
<<<<<<< HEAD
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
=======
          initialView="timeGridWeek" 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
<<<<<<< HEAD
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
=======
          events={events} 
          eventClick={handleEventClick} 
          dateClick={handleDateClick} 
          editable={false} 
          selectable={true}
          allDaySlot={false}
          slotMinTime="08:00:00" 
          slotMaxTime="20:00:00" 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
<<<<<<< HEAD
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
=======
          height="auto" 
        />
      </div>

>>>>>>> 67ec8a26 (Producto terminado (Creo))
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
<<<<<<< HEAD
      {/* Modal de Formulario (Crear/Editar) */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
      {formModalOpen && (
        <TurnoFormAdmin
          turnoIdToEdit={selectedTurnoId}
          onClose={handleCloseFormModal}
        />
      )}
      
<<<<<<< HEAD
<<<<<<< HEAD
      {/* Modal de Confirmar Eliminación */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
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