// front/src/components/Turnos/TurnoDetailModal.jsx
import React from 'react';
import Modal from '../Common/Modal';
import '../../CSS/TurnoDetailModal.css';

// Función auxiliar para formatear duración
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m} min`;
};

export default function TurnoDetailModal({ turno, onClose, onEdit, onDelete, onUpdateStatus, loading }) {

  if (!turno) return null;

  const duracionTotalMinutos = turno.duracion_total_minutos || 0;

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Detalle del Turno"
      footer={
        <div className="modal-footer-admin">
          <button 
            className="btn-danger-text" 
            onClick={onDelete} 
            disabled={loading}
          >
            Eliminar
          </button>
          <div className="footer-actions">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cerrar
            </button>
            <button className="btn btn-primary" onClick={onEdit} disabled={loading}>
              Editar Turno
            </button>
          </div>
        </div>
      }
    >
      <div className="turno-detalle-info">
        <p><strong>Cliente:</strong> {turno.cliente_nombre || "No asignado"}</p>
        <p><strong>Fecha:</strong> {new Date(turno.fecha_hora_inicio).toLocaleDateString('es-AR')}</p>
        <p><strong>Hora Inicio:</strong> {new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
        <p><strong>Hora Fin:</strong> {new Date(turno.fecha_hora_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
        <p><strong>Duración:</strong> {formatDuration(duracionTotalMinutos)}</p>
        <p>
          <strong>Estado:</strong> 
          <span className={`badge estado-${turno.estado}`}>
            {turno.estado}
          </span>
          {turno.solicitud_cancelacion && (
            <span className="badge badge-warning" style={{ marginLeft: "8px" }}>
              Solicitud de Cancelación Pendiente
            </span>
          )}
        </p>

        {/* Botones de cambio de estado rápido */}
        <div className="estado-actions">
          {turno.estado === 'pendiente' && (
            <button 
              onClick={() => onUpdateStatus('confirmado')} 
              disabled={loading}
              className="btn btn-success"
            >
              Confirmar Turno
            </button>
          )}
          {turno.estado === 'confirmado' && (
             <button 
                onClick={() => onUpdateStatus('completado')} 
                disabled={loading}
                className="btn btn-secondary"
            >
                Marcar Completado
            </button>
          )}
          {turno.estado !== 'cancelado' && (
             <button 
                onClick={() => onUpdateStatus('cancelado')} 
                disabled={loading}
                className="btn btn-danger"
            >
                Cancelar Turno
            </button>
          )}

          {/* Botón para aceptar solicitud de cancelación */}
          {turno.solicitud_cancelacion && turno.estado !== 'cancelado' && (
            <button
              onClick={() => onUpdateStatus('cancelado')}
              disabled={loading}
              className="btn btn-warning"
              style={{ marginLeft: "10px" }}
            >
              Aceptar Solicitud de Cancelación
            </button>
          )}
        </div>

        <h4>Servicios Incluidos:</h4>
        {turno.servicios_asignados && turno.servicios_asignados.length > 0 ? (
          <ul>
            {turno.servicios_asignados.map((item) => (
              <li key={item.servicio.id_serv}>
                {item.servicio?.nombre_serv || 'Servicio Desconocido'} 
                (${item.servicio?.precio_serv || 'N/A'})
                - ({item.duracion_servicio} min)
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay servicios asociados.</p>
        )}

        {turno.observaciones && (
          <>
            <h4>Observaciones:</h4>
            <p className="observaciones-box">{turno.observaciones}</p>
          </>
        )}
      </div>
    </Modal>
  );
}
