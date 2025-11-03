import React from 'react';
import Modal from '../Common/Modal';

// Función auxiliar
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m} min`;
};

export default function TurnoDetailModal({ turno, onClose, onEdit, onDelete, onUpdateStatus, loading }) {

  if (!turno) return null;

  // La duración ya viene calculada por el backend
  const duracionTotalMinutos = turno.duracion_total_minutos || 0;

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Detalle del Turno"
      footer={
        <div className="modal-footer-admin">
          <button 
            className="btn btn-danger-text" 
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
        {/* El campo 'profesional' ya no existe en este modal */}
        <p><strong>Fecha:</strong> {new Date(turno.fecha_hora_inicio).toLocaleDateString('es-AR')}</p>
        <p><strong>Hora Inicio:</strong> {new Date(turno.fecha_hora_inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
        <p><strong>Hora Fin:</strong> {new Date(turno.fecha_hora_fin).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
        <p><strong>Duración:</strong> {formatDuration(duracionTotalMinutos)}</p>
        <p><strong>Estado:</strong> 
          <span className={`badge estado-${turno.estado}`}>
            {turno.estado}
          </span>
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
                className="btn btn-warning"
            >
                Cancelar Turno
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
      
      {/* CSS Local para el modal de detalle */}
      <style>{`
        .turno-detalle-info p {
          margin-bottom: 10px;
          color: var(--text-color-muted);
        }
        .turno-detalle-info strong {
          color: var(--text-color);
          margin-right: 8px;
          min-width: 100px;
        }
        .turno-detalle-info h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
          margin-top: 15px; margin-bottom: 8px;
          border-top: 1px solid var(--border-color);
          padding-top: 10px;
        }
        .turno-detalle-info ul { list-style: none; padding-left: 15px; }
        .turno-detalle-info li { margin-bottom: 4px; }
        
        .observaciones-box {
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          padding: 10px; border-radius: 4px;
          white-space: pre-wrap; max-height: 100px; overflow-y: auto;
        }
        .modal-footer-admin { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        .btn-danger-text { background: none; border: none; color: var(--danger-color); cursor: pointer; }
        
        .badge { /* (Copiado de UsList) */
          padding: 4px 8px; border-radius: 12px; font-size: 0.75rem;
          font-weight: 500; text-transform: capitalize;
        }
        .estado-pendiente { background-color: rgba(202, 138, 4, 0.1); color: var(--warning-color); }
        .estado-confirmado { background-color: rgba(5, 150, 105, 0.1); color: var(--success-color); }
        .estado-cancelado { background-color: rgba(225, 29, 72, 0.1); color: var(--danger-color); }
        .estado-completado { background-color: var(--border-color); color: var(--text-color-muted); }

        .estado-actions { display: flex; gap: 10px; margin-top: 1rem; flex-wrap: wrap; }
        .btn-success { background-color: var(--success-color); color: white; }
        .btn-warning { background-color: var(--warning-color); color: black; }
      `}</style>
    </Modal>
  );
}