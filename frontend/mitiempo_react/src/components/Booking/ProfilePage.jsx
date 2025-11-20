// src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './profile.css';

// 💡 --- IMPORTACIONES ACTUALIZADAS ---
import { getTurnos } from '../../api/turnos';
// ------------------------------------

export default function ProfilePage() {
    const [turnos, setTurnos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); 

    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        // 💡 Usa la nueva función 'getTurnos' con parámetros
        getTurnos({ id_cli: user.id }) 
            .then(response => {
                setTurnos(response.data);
            })
            .catch(err => {
                setError("Error al cargar tus turnos.");
            })
            .finally(() => setIsLoading(false));
    }, [user]);

    const turnosPendientes = turnos.filter(t => t.estado_turno === 'pendiente');
    const turnosConfirmados = turnos.filter(t => t.estado_turno === 'confirmado');
    const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado_turno));

    // ... (El JSX del return es idéntico al anterior)
    return (
        <div className="app-container profile-page">
            <h2>Mis Turnos</h2>
            {isLoading && <p>Cargando turnos...</p>}
            {error && <p className="error-message">{error}</p>}

            <section className="turnos-section">
                <h3>Turnos Pendientes</h3>
                {turnosPendientes.length > 0 ? (
                    turnosPendientes.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
                ) : (
                    <p>No tienes turnos pendientes.</p>
                )}
            </section>

            <section className="turnos-section">
                <h3>Turnos Confirmados</h3>
                {turnosConfirmados.length > 0 ? (
                    turnosConfirmados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
                ) : (
                    <p>No tienes turnos confirmados.</p>
                )}
            </section>
            
            <section className="turnos-section">
                <h3>Historial</h3>
                {turnosPasados.length > 0 ? (
                    turnosPasados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
                ) : (
                    <p>No tienes historial de turnos.</p>
                )}
            </section>
        </div>
    );
}

// ... (El componente TurnoCard es idéntico al anterior)
function TurnoCard({ turno }) {
    const { fecha_turno, hora_turno, servicios, profesional, estado_turno } = turno;
    const fecha = new Date(`${fecha_turno}T${hora_turno}`);
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const horaFormateada = fecha.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`turno-card estado-${estado_turno}`}>
            <div className="turno-card-header">
                <strong>{fechaFormateada} - {horaFormateada} hs</strong>
                <span className="turno-estado">{estado_turno}</span>
            </div>
            <div className="turno-card-body">
                <p>
                    <strong>Servicios: </strong>
                    {servicios.map(s => s.servicio.nombre_serv).join(', ')}
                </p>
                <p>
                    <strong>Profesional: </strong>
                    {profesional}
                </p>
            </div>
        </div>
    );
}