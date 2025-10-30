// src/components/admin/TurnoDetailModal.jsx
import React, { useState } from 'react';
import Modal from '../../components/Common/Modal';

// 💡 --- IMPORTACIONES ACTUALIZADAS ---
import { updateTurno, deleteTurno } from '../../api/turnos';
// ------------------------------------

export default function TurnoDetailModal({ isOpen, onClose, turno, onTurnoUpdate }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!turno) return null;

    const handleUpdateEstado = async (nuevoEstado) => {
        setIsLoading(true);
        setError(null);
        try {
            // 💡 Usa la nueva función 'updateTurno'
            await updateTurno(turno.id_turno, { estado_turno: nuevoEstado });
            onTurnoUpdate(); // Llama al padre para refrescar
        } catch (err) {
            setError(`Error al ${nuevoEstado} el turno.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres ELIMINAR este turno permanentemente?")) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // 💡 Usa la nueva función 'deleteTurno'
            await deleteTurno(turno.id_turno);
            onTurnoUpdate();
        } catch (err) {
            setError("Error al eliminar el turno.");
        } finally {
            setIsLoading(false);
        }
    };

    // ... (El JSX del return es idéntico al anterior)
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Turno">
            <div className="turno-detail">
                <p><strong>Cliente:</strong> {turno.cliente}</p>
                <p><strong>Profesional:</strong> {turno.profesional}</p>
                <p><strong>Fecha:</strong> {turno.fecha_turno}</p>
                <p><strong>Hora:</strong> {turno.hora_turno}</p>
                <p><strong>Estado:</strong> {turno.estado_turno}</p>
                
                <strong>Servicios:</strong>
                <ul>
                    {turno.servicios?.map(s => (
                        <li key={s.id_turno_servicio}>
                            {s.servicio.nombre_serv} (${s.servicio.precio_serv})
                        </li>
                    ))}
                </ul>

                {error && <p className="error-message">{error}</p>}

                <div className="modal-actions-admin">
                    {turno.estado_turno === 'pendiente' && (
                        <button 
                            onClick={() => handleUpdateEstado('confirmado')} 
                            disabled={isLoading}
                            className="btn-confirm"
                        >
                            Confirmar Turno
                        </button>
                    )}
                    
                    {turno.estado_turno !== 'cancelado' && (
                         <button 
                            onClick={() => handleUpdateEstado('cancelado')} 
                            disabled={isLoading}
                            className="btn-cancel"
                        >
                            Cancelar Turno
                        </button>
                    )}
                   
                    <button 
                        onClick={handleDelete} 
                        disabled={isLoading}
                        className="btn-delete"
                    >
                        Eliminar (¡Peligro!)
                    </button>
                </div>
            </div>
        </Modal>
    );
}