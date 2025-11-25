<<<<<<< HEAD
// front/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
// 💡 1. Importamos el CSS rediseñado
import '../../CSS/ProfilePage.css'; 

import { getTurnos } from '../../api/turnos'; 
// 💡 2. Importamos el componente TurnoCard reutilizable
import TurnoCard from '../../components/Turnos/TurnoCard';
=======
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import '../../CSS/ProfilePage.css'; 
import { getTurnos, solicitarCancelacionTurno } from '../../api/turnos'; 
import TurnoCard from '../../components/Turnos/TurnoCard';
import toast from 'react-hot-toast';
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be

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
<<<<<<< HEAD
                // 💡 Asumimos que la API devuelve 'id_turno' como PK
=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
                setTurnos(response.data);
            })
            .catch(err => {
                setError("Error al cargar tus turnos.");
            })
            .finally(() => setIsLoading(false));
    }, [user]);

<<<<<<< HEAD
=======
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

>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    const turnosPendientes = turnos.filter(t => t.estado === 'pendiente');
    const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado');
    const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado));

    return (
        <div className="app-container profile-page">
            <h2>Mis Turnos</h2>
            
<<<<<<< HEAD
            {/* 💡 3. Usamos la clase de alerta global */}
=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
            {isLoading && <p>Cargando turnos...</p>}
            {error && <div className="alert alert-error">{error}</div>}

            <section className="turnos-section">
                <h3>Turnos Pendientes</h3>
                {turnosPendientes.length > 0 ? (
<<<<<<< HEAD
                    // 💡 4. Usamos el componente TurnoCard importado
                    //    y la key 'id_turno'
                    turnosPendientes.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
=======
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
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
                ) : (
                    <p className="empty-message">No tienes turnos pendientes.</p>
                )}
            </section>

            <section className="turnos-section">
                <h3>Turnos Confirmados</h3>
                {turnosConfirmados.length > 0 ? (
<<<<<<< HEAD
                    turnosConfirmados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
=======
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
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
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
<<<<<<< HEAD

// 💡 5. Se eliminó la definición local de TurnoCard
=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
