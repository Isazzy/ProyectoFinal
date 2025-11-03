import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import '../../CSS/ProfilePage.css';

// --- IMPORTACIONES ACTUALIZADAS ---
import { getTurnos } from '../../api/turnos'; // Asumimos que esta función existe

export default function ProfilePage() {
    const [turnos, setTurnos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth(); 

    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        // --- CAMBIO ---
        // getTurnos() ya no necesita parámetros.
        // El ViewSet filtra por el usuario autenticado (request.user)
        getTurnos() 
            .then(response => {
                setTurnos(response.data);
            })
            .catch(err => {
                setError("Error al cargar tus turnos.");
            })
            .finally(() => setIsLoading(false));
    }, [user]);

    // --- CAMBIO ---
    // El campo se llama 'estado', no 'estado_turno'
    const turnosPendientes = turnos.filter(t => t.estado === 'pendiente');
    const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado');
    const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado));

    return (
        <div className="app-container profile-page">
            <h2>Mis Turnos</h2>
            {isLoading && <p>Cargando turnos...</p>}
            {error && <p className="error-message">{error}</p>}

            <section className="turnos-section">
                <h3>Turnos Pendientes</h3>
                {turnosPendientes.length > 0 ? (
                    // --- CAMBIO --- El key ahora es 'id'
                    turnosPendientes.map(turno => <TurnoCard key={turno.id} turno={turno} />)
                ) : (
                    <p>No tienes turnos pendientes.</p>
                )}
            </section>

            <section className="turnos-section">
                <h3>Turnos Confirmados</h3>
                {turnosConfirmados.length > 0 ? (
                    // --- CAMBIO --- El key ahora es 'id'
                    turnosConfirmados.map(turno => <TurnoCard key={turno.id} turno={turno} />)
                ) : (
                    <p>No tienes turnos confirmados.</p>
                )}
            </section>
            
            <section className="turnos-section">
                <h3>Historial</h3>
                {turnosPasados.length > 0 ? (
                    // --- CAMBIO --- El key ahora es 'id'
                    turnosPasados.map(turno => <TurnoCard key={turno.id} turno={turno} />)
                ) : (
                    <p>No tienes historial de turnos.</p>
                )}
            </section>
        </div>
    );
}


function TurnoCard({ turno }) {
    // --- CAMBIO ---
    // Desestructuramos los nuevos campos del serializer
    const { 
        fecha_hora_inicio, // String ISO (ej: "2025-11-05T14:30:00Z")
        servicios_asignados, // Array (ej: [{ servicio: { nombre_serv: ... } }])
        estado,
        duracion_total_minutos 
    } = turno;

    // --- CAMBIO ---
    // Creamos el objeto Date directamente desde el string ISO
    const fecha = new Date(fecha_hora_inicio);
    
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
        // --- CAMBIO ---
        <div className={`turno-card estado-${estado}`}>
            <div className="turno-card-header">
                <strong>{fechaFormateada} - {horaFormateada} hs</strong>
                {/* --- CAMBIO --- */}
                <span className="turno-estado">{estado}</span>
            </div>
            <div className="turno-card-body">
                <p>
                    <strong>Servicios: </strong>
                   
                    {servicios_asignados && servicios_asignados.length > 0 
                        ? servicios_asignados.map(item => item.servicio.nombre_serv).join(', ')
                        : "N/A"
                    }
                </p>
                <p>
                   
                    <strong>Duración: </strong>
                    {duracion_total_minutos} minutos
                </p>
            </div>
        </div>
    );
}