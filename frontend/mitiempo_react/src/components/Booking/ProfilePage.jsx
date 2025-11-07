import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import '../../CSS/ProfilePage.css'; 
import { getTurnos, solicitarCancelacionTurno } from '../../api/turnos'; 
import TurnoCard from '../../components/Turnos/TurnoCard';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const [turnos, setTurnos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); 

    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        getTurnos() 
            .then(response => {
                setTurnos(response.data);
            })
            .catch(err => {
                setError("Error al cargar tus turnos.");
            })
            .finally(() => setIsLoading(false));
    }, [user]);

    const handleCancelarSolicitud = async (id_turno) => {
        try {
            await solicitarCancelacionTurno(id_turno);
            toast.success("Solicitud de cancelación enviada al administrador.");
            // Actualizar estado local
            setTurnos(prev => prev.map(t => 
                t.id_turno === id_turno ? { ...t, estado: 'solicitud_cancelada' } : t
            ));
        } catch (err) {
            toast.error("No se pudo enviar la solicitud.");
        }
    };

    const turnosPendientes = turnos.filter(t => t.estado === 'pendiente');
    const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado');
    const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado));

    return (
        <div className="app-container profile-page">
            <h2>Mis Turnos</h2>
            
            {isLoading && <p>Cargando turnos...</p>}
            {error && <div className="alert alert-error">{error}</div>}

            <section className="turnos-section">
                <h3>Turnos Pendientes</h3>
                {turnosPendientes.length > 0 ? (
                    turnosPendientes.map(turno => (
                        <div key={turno.id_turno} className="turno-wrapper">
                            <TurnoCard turno={turno} />
                            {turno.estado !== 'solicitud_cancelada' && (
                                <button
                                    className="btn btn-warning btn-small"
                                    onClick={() => handleCancelarSolicitud(turno.id_turno)}
                                >
                                    Solicitar Cancelación
                                </button>
                            )}
                            {turno.estado === 'solicitud_cancelada' && (
                                <span className="label-cancel-solicitud">Solicitud enviada</span>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="empty-message">No tienes turnos pendientes.</p>
                )}
            </section>

            <section className="turnos-section">
                <h3>Turnos Confirmados</h3>
                {turnosConfirmados.length > 0 ? (
                    turnosConfirmados.map(turno => (
                        <div key={turno.id_turno} className="turno-wrapper">
                            <TurnoCard turno={turno} />
                            {turno.estado !== 'solicitud_cancelada' && (
                                <button
                                    className="btn btn-warning btn-small"
                                    onClick={() => handleCancelarSolicitud(turno.id_turno)}
                                >
                                    Solicitar Cancelación
                                </button>
                            )}
                            {turno.estado === 'solicitud_cancelada' && (
                                <span className="label-cancel-solicitud">Solicitud enviada</span>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="empty-message">No tienes turnos confirmados.</p>
                )}
            </section>
            
            <section className="turnos-section">
                <h3>Historial</h3>
                {turnosPasados.length > 0 ? (
                    turnosPasados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
                ) : (
                    <p className="empty-message">No tienes historial de turnos.</p>
                )}
            </section>
        </div>
    );
}
