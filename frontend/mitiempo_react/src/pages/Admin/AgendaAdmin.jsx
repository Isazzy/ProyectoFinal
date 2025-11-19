<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// src/pages/Admin/AgendaAdmin.jsx
=======
// front/src/pages/Admin/AgendaAdmin.jsx
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
// front/src/pages/Admin/AgendaAdmin.jsx
>>>>>>> 632fee59 (Cambios)
=======
// src/components/agenda/AdminAgenda.jsx
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
<<<<<<< HEAD
<<<<<<< HEAD
import interactionPlugin from '@fullcalendar/interaction'; // Para clicks
=======
import interactionPlugin from '@fullcalendar/interaction';
<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
import interactionPlugin from '@fullcalendar/interaction';
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
import esLocale from '@fullcalendar/core/locales/es';
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
import toast from 'react-hot-toast';
import api from "../../api/axiosConfig";
import Modal from '../../components/Common/Modal';
<<<<<<< HEAD
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
=======
import TurnoDetailModal from '../../components/Turnos/TurnoDetailModal';
import TurnoFormAdmin from '../../components/Turnos/TurnoFormAdmin';
import CobroModal from '../../components/Turnos/CobroModal';
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)

import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

import './AdminAgenda.css';
import { getTurnos, updateTurno, deleteTurno } from "../../api/turnos";

<<<<<<< HEAD
// 🎨 --- COLORES ACTUALIZADOS --- 
// Colores más elegantes y alineados con el nuevo tema.
<<<<<<< HEAD
=======
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
const ESTADO_COLORS = {
  'pendiente': '#f59e0b',
  'confirmado': '#059669',
  'completado': '#3b82f6',
  'cancelado': '#777777',
};

const ESTADO_INFO = {
  'pendiente': { icon: Clock, label: 'Pendiente', color: '#f59e0b' },
  'confirmado': { icon: CheckCircle, label: 'Confirmado', color: '#059669' },
  'completado': { icon: CheckCircle, label: 'Completado', color: '#3b82f6' },
  'cancelado': { icon: XCircle, label: 'Cancelado', color: '#777777' },
};
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======

=======
>>>>>>> 632fee59 (Cambios)
const ESTADO_COLORS = {
  'pendiente': '#f59e0b', // Ámbar (para advertencia)
  'confirmado': '#059669', // Verde (éxito)
  'completado': '#3b82f6', // Azul (informativo)
  'cancelado': '#777777',  // Gris (color secundario de texto)
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
=======

  const [selectedTurno, setSelectedTurno] = useState(null);
  const [selectedTurnoId, setSelectedTurnoId] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);

  const [cobroModalOpen, setCobroModalOpen] = useState(false);
  const [turnoParaCobrar, setTurnoParaCobrar] = useState(null);

>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  useEffect(() => {
    loadTurnos();
  }, []);

  const loadTurnos = () => {
    setLoading(true);
<<<<<<< HEAD
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
=======
    getTurnos()
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      .then(response => {
        const calendarEvents = response.data.map(turno => ({
          id: turno.id_turno,
<<<<<<< HEAD
<<<<<<< HEAD
=======
          id: turno.id_turno, // <- Corregido para usar id_turno
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
>>>>>>> 632fee59 (Cambios)
          title: turno.cliente_nombre, 
          start: turno.fecha_hora_inicio, 
          end: turno.fecha_hora_fin, 
          backgroundColor: ESTADO_COLORS[turno.estado] || '#777',
          borderColor: ESTADO_COLORS[turno.estado] || '#777',
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 632fee59 (Cambios)
          textColor: '#ffffff', // 🎨 Aseguramos texto blanco en eventos
          extendedProps: { ...turno } 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
          extendedProps: { ...turno } 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
          title: turno.cliente_nombre || Cliente ${turno.cliente || ''},
          start: turno.fecha_hora_inicio,
          end: turno.fecha_hora_fin,
          backgroundColor: ESTADO_COLORS[turno.estado] || '#777',
          borderColor: ESTADO_COLORS[turno.estado] || '#777',
          textColor: '#ffffff',
          extendedProps: { ...turno }
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
        }));
        setEvents(calendarEvents);
      })
      .catch(() => toast.error("Error al cargar la agenda."))
      .finally(() => setLoading(false));
  };

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
>>>>>>> 632fee59 (Cambios)
  // --- El resto de los manejadores (sin cambios) ---

=======
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  const handleEventClick = (clickInfo) => {
    const turnoCompleto = clickInfo.event.extendedProps;
    if (turnoCompleto) {
      setSelectedTurno(turnoCompleto);
<<<<<<< HEAD
      setViewModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
      setViewModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
      setViewModalOpen(true);
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    }
  };

  const handleDateClick = (arg) => {
<<<<<<< HEAD
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
=======
    const clickedDate = new Date(arg.date);
    setSelectedDateTime(clickedDate);
    setSelectedTurnoId(null);
    setFormModalOpen(true);
  };

>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTurno(null);
  };
<<<<<<< HEAD
  
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
=======

  const handleCloseFormModal = (didSave = false) => {
    setFormModalOpen(false);
    setSelectedTurnoId(null);
    setSelectedDateTime(null);
    if (didSave) loadTurnos();
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  };

  const handleEditFromView = () => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    setSelectedTurnoId(selectedTurno.id_turno); // Pasa el ID al formulario
    setViewModalOpen(false); // Cierra modal de vista
    setFormModalOpen(true); // Abre modal de formulario
=======
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
=======
    setSelectedTurnoId(selectedTurno.id_turno);
>>>>>>> 632fee59 (Cambios)
    setViewModalOpen(false); 
    setFormModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
  };

  const handleUpdateStatus = async (nuevoEstado) => {
    if (!selectedTurno) return;
    setLoading(true);
    
    try {
      await updateTurno(selectedTurno.id_turno, { estado: nuevoEstado });
      toast.success(`Turno ${nuevoEstado}`);
<<<<<<< HEAD
      loadTurnos(); // Recarga
=======
    setSelectedTurnoId(selectedTurno.id_turno);
    setViewModalOpen(false);
    setFormModalOpen(true);
  };

  const handleUpdateStatus = async (accion) => {
    if (!selectedTurno) return;
    setLoading(true);

    try {
<<<<<<< HEAD
      await updateTurno(selectedTurno.id_turno, { estado: nuevoEstado });
      toast.success(`Turno ${nuevoEstado}`);
      loadTurnos(); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
      loadTurnos(); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
    } catch (err) {
      toast.error("Error al actualizar estado.");
=======
      if (accion === 'cobrar') {
        setTurnoParaCobrar(selectedTurno);
        setCobroModalOpen(true);
        setLoading(false);
        return;
      }

      if (accion === 'completar') {
        await api.post(/turnos/${selectedTurno.id_turno}/marcar_completado/);
        toast.success("Turno completado correctamente");
      } else {
        await updateTurno(selectedTurno.id_turno, { estado: accion });
        toast.success(Turno actualizado a ${accion});
      }

      loadTurnos();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el turno.");
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
    } finally {
      setLoading(false);
      handleCloseViewModal();
    }
  };

  const handleConfirmCobro = async (metodoPago) => {
    if (!turnoParaCobrar) return;

    if (!['Efectivo', 'Transferencia'].includes(metodoPago)) {
      toast.error("Solo se permite cobrar en Efectivo o Transferencia.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(/turnos/${turnoParaCobrar.id_turno}/cobrar_turno/, { metodo_pago: metodoPago });
      toast.success(res.data.mensaje || "Turno cobrado correctamente");
      loadTurnos();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const msg = err.response.data.detail || err.response.data.error || err.response.data.mensaje;
        if (msg) toast.error(msg);
        else toast.error("Error al procesar el cobro.");
      } else {
        toast.error("Error al procesar el cobro.");
      }
    } finally {
      setLoading(false);
      setCobroModalOpen(false);
      setTurnoParaCobrar(null);
      handleCloseViewModal();
    }
  };

  const handleDeleteRequest = () => {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    setSelectedTurnoId(selectedTurno.id_turno); // Guarda el ID a borrar
    setViewModalOpen(false); // Cierra modal de vista
    setDeleteModalOpen(true); // Abre modal de confirmación
=======
    setSelectedTurnoId(selectedTurno.id_turno);
<<<<<<< HEAD
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
    setSelectedTurnoId(selectedTurno.id_turno); // <- Corregido para usar id_turno
=======
    setSelectedTurnoId(selectedTurno.id_turno);
>>>>>>> 632fee59 (Cambios)
    setViewModalOpen(false); 
    setDeleteModalOpen(true); 
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
    setViewModalOpen(false);
    setDeleteModalOpen(true);
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTurnoId) return;
    setLoading(true);
    try {
      await deleteTurno(selectedTurnoId);
      toast.success("Turno eliminado.");
      loadTurnos();
    } catch {
      toast.error("Error al eliminar el turno.");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setSelectedTurnoId(null);
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  return (
    <div className="admin-page-container admin-agenda">
      {loading && <p>Cargando agenda...</p>}
=======
  // --- Renderizado ---
>>>>>>> 632fee59 (Cambios)

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
<<<<<<< HEAD
          initialView="timeGridWeek" // Vista semanal
=======
  // --- Renderizado ---
=======
  // Estadísticas
  const totalTurnos = events.length;
  const turnosPendientes = events.filter(e => e.extendedProps?.estado === 'pendiente').length;
  const turnosConfirmados = events.filter(e => e.extendedProps?.estado === 'confirmado').length;
  const turnosCompletados = events.filter(e => e.extendedProps?.estado === 'completado').length;
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)

  return (
    <div className="agenda-page">
      
      {/* Header Hero Section */}
      <div className="agenda-hero-header">
        <div className="agenda-hero-container">
          <div className="agenda-hero-content">
            
            {/* Left Side - Title & Stats */}
            <div className="agenda-hero-left">
              <div className="agenda-title-section">
                <div className="agenda-icon-badge">
                  <Calendar className="agenda-icon-large" />
                </div>
                <div>
                  <h1 className="agenda-main-title">Agenda de Turnos</h1>
                  <p className="agenda-subtitle">Gestiona citas y horarios</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="agenda-stats-grid">
                <div className="agenda-stat-card">
                  <TrendingUp className="agenda-stat-icon agenda-stat-icon-blue" />
                  <div>
                    <p className="agenda-stat-number">{totalTurnos}</p>
                    <p className="agenda-stat-label">Total Turnos</p>
                  </div>
                </div>
                <div className="agenda-stat-card">
                  <Clock className="agenda-stat-icon agenda-stat-icon-yellow" />
                  <div>
                    <p className="agenda-stat-number">{turnosPendientes}</p>
                    <p className="agenda-stat-label">Pendientes</p>
                  </div>
                </div>
                <div className="agenda-stat-card">
                  <CheckCircle className="agenda-stat-icon agenda-stat-icon-green" />
                  <div>
                    <p className="agenda-stat-number">{turnosConfirmados}</p>
                    <p className="agenda-stat-label">Confirmados</p>
                  </div>
                </div>
                <div className="agenda-stat-card">
                  <CheckCircle className="agenda-stat-icon agenda-stat-icon-cyan" />
                  <div>
                    <p className="agenda-stat-number">{turnosCompletados}</p>
                    <p className="agenda-stat-label">Completados</p>
                  </div>
                </div>
              </div>
            </div>

<<<<<<< HEAD
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
<<<<<<< HEAD
          height="auto" // Ajusta altura al contenedor
        />
      </div>

      {/* --- Modales --- */}

      {/* Modal de Vista (Solo Lectura) */}
=======
=======
>>>>>>> 632fee59 (Cambios)
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
<<<<<<< HEAD
        />
=======
            {/* Right Side - Actions */}
            <div className="agenda-hero-actions">
              <button
                onClick={() => loadTurnos()}
                className="agenda-refresh-button"
                disabled={loading}
              >
                <RefreshCw className={agenda-button-icon ${loading ? 'spinning' : ''}} />
                Actualizar
              </button>
              
              <button
                onClick={() => {
                  setSelectedDateTime(new Date());
                  setSelectedTurnoId(null);
                  setFormModalOpen(true);
                }}
                className="agenda-new-button"
              >
                <Plus className="agenda-button-icon" />
                Nuevo Turno
              </button>
            </div>
          </div>
        </div>
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      </div>

      {/* Main Content */}
      <div className="agenda-main-container">
        
        {/* Leyenda de Estados */}
        <div className="agenda-legend">
          <h3 className="agenda-legend-title">
            <Filter className="agenda-legend-icon" />
            Leyenda de Estados
          </h3>
          <div className="agenda-legend-items">
            {Object.entries(ESTADO_INFO).map(([key, info]) => {
              const IconComponent = info.icon;
              return (
                <div key={key} className="agenda-legend-item">
                  <div className="agenda-legend-color" style={{ backgroundColor: info.color }}></div>
                  <IconComponent className="agenda-legend-item-icon" style={{ color: info.color }} />
                  <span className="agenda-legend-label">{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>

<<<<<<< HEAD
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
          height="auto" 
        />
      </div>

>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======
        />
      </div>

      {/* --- Modales (usando el nuevo estilo de index.css y App.css) --- */}

>>>>>>> 632fee59 (Cambios)
=======
        {/* Calendario */}
        <div className="agenda-calendar-card">
          {loading && (
            <div className="agenda-loading-overlay">
              <div className="agenda-spinner"></div>
              <p>Cargando agenda...</p>
            </div>
          )}
          
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
            locale={esLocale}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
            }}
            height="auto"
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
            slotDuration="00:30:00"
            snapDuration="00:15:00"
            nowIndicator={true}
            eventContent={(arg) => {
              const turno = arg.event.extendedProps;
              const estadoInfo = ESTADO_INFO[turno.estado];
              const IconComponent = estadoInfo?.icon || Clock;
              
              return (
                <div className="agenda-event-content">
                  <IconComponent className="agenda-event-icon" />
                  <div className="agenda-event-text">
                    <div className="agenda-event-time">{arg.timeText}</div>
                    <div className="agenda-event-title">{arg.event.title}</div>
                  </div>
                </div>
              );
            }}
          />
        </div>

      </div>

      {/* Modals */}
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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
<<<<<<< HEAD
      {/* Modal de Formulario (Crear/Editar) */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======

>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      {formModalOpen && (
        <TurnoFormAdmin
          turnoIdToEdit={selectedTurnoId}
          onClose={handleCloseFormModal}
          preselectedDateTime={selectedDateTime}
        />
      )}
<<<<<<< HEAD
      
<<<<<<< HEAD
<<<<<<< HEAD
      {/* Modal de Confirmar Eliminación */}
=======
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
>>>>>>> 67ec8a26 (Producto terminado (Creo))
=======

      {cobroModalOpen && (
        <CobroModal
          turno={turnoParaCobrar}
          onClose={() => setCobroModalOpen(false)}
          onConfirm={handleConfirmCobro}
          loading={loading}
        />
      )}

>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
            {/* 🎨 Clases de botones del nuevo sistema de diseño */}
>>>>>>> parent of def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
=======
            {/* 🎨 Clases de botones del nuevo sistema de diseño */}
>>>>>>> 632fee59 (Cambios)
            <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary" disabled={loading}>Cancelar</button>
=======
            <button onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary" disabled={loading}>
              Cancelar
            </button>
>>>>>>> def20f14 (creacion de caja, movimiento_caja, mod venta mod compra)
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