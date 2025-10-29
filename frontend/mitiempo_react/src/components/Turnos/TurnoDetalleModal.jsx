import React from "react";
// Reutiliza los estilos del modal o crea unos nuevos

import "../../CSS/TurnoDetalleModal.css"; // CSS específico para este modal

// Función auxiliar para formatear duración (si la necesitas)
const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
    return `${m} min`;
};

export default function TurnoDetalleModal({ turno, onClose, onEdit, onDelete }) {
    
    // Si no hay datos del turno, no mostrar nada o un mensaje de carga/error
    if (!turno) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content turno-detalle-modal" onClick={(e) => e.stopPropagation()}>
                    <p>Cargando detalles del turno...</p>
                    <div className="modal-footer">
                        <button className="btn-modal-cancel" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        );
    }

    // Calcula duración total si 'servicios' está disponible
    const duracionTotalMinutos = turno.servicios?.reduce((total, s) => 
        total + (s.servicio?.duracion_minutos || 0), 0) || 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content turno-detalle-modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Detalle del Turno</h2>

                <div className="turno-detalle-info">
                    <p><strong>Cliente:</strong> {turno.cliente || "No asignado"}</p>
                    <p><strong>Profesional:</strong> {turno.profesional || "No asignado"}</p>
                    <p><strong>Fecha:</strong> {new Date(turno.start).toLocaleDateString('es-AR') || turno.fecha_turno}</p>
                    <p><strong>Hora Inicio:</strong> {new Date(turno.start).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) || turno.hora_turno}</p>
                    <p><strong>Hora Fin (Estimada):</strong> {new Date(turno.end).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Duración Estimada:</strong> {formatDuration(duracionTotalMinutos)}</p>
                    <p><strong>Estado:</strong> <span className={`estado-turno estado-${turno.estado_turno}`}>{turno.estado_turno || "Pendiente"}</span></p>
                    
                    <h4>Servicios Incluidos:</h4>
                    {turno.servicios && turno.servicios.length > 0 ? (
                        <ul>
                            {turno.servicios.map((item, index) => (
                                <li key={index}>
                                    - {item.servicio?.nombre_serv || 'Servicio Desconocido'} (${item.servicio?.precio_serv || 'N/A'})
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

                {/* Botones de Acción */}
                <div className="modal-footer">
                    {/* Botón Borrar/Cancelar Turno */}
                    <button 
                        className="btn-delete-user" // Reutiliza estilo de botón eliminar
                        onClick={() => onDelete(turno.id_turno, turno.title)} 
                    >
                        Cancelar Turno
                    </button>
                    
                    <div className="footer-actions">
                        {/* Botón Cerrar Modal */}
                        <button className="btn-modal-cancel" onClick={onClose}>
                            Cerrar
                        </button>
                        {/* Botón Editar Turno */}
                        <button className="btn-modal-save" onClick={() => onEdit(turno.id_turno)}>
                            Editar Turno
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}