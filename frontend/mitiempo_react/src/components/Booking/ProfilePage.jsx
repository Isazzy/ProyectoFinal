// front/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
// 💡 1. Importamos el CSS rediseñado
import '../../CSS/ProfilePage.css'; 

import { getTurnos } from '../../api/turnos'; 
// 💡 2. Importamos el componente TurnoCard reutilizable
import TurnoCard from '../../components/Turnos/TurnoCard';

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
                // 💡 Asumimos que la API devuelve 'id_turno' como PK
                setTurnos(response.data);
            })
            .catch(err => {
                setError("Error al cargar tus turnos.");
            })
            .finally(() => setIsLoading(false));
    }, [user]);

    const turnosPendientes = turnos.filter(t => t.estado === 'pendiente');
    const turnosConfirmados = turnos.filter(t => t.estado === 'confirmado');
    const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado));

    return (
        <div className="app-container profile-page">
            <h2>Mis Turnos</h2>
            
            {/* 💡 3. Usamos la clase de alerta global */}
            {isLoading && <p>Cargando turnos...</p>}
            {error && <div className="alert alert-error">{error}</div>}

            <section className="turnos-section">
                <h3>Turnos Pendientes</h3>
                {turnosPendientes.length > 0 ? (
                    // 💡 4. Usamos el componente TurnoCard importado
                    //    y la key 'id_turno'
                    turnosPendientes.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
                ) : (
                    <p className="empty-message">No tienes turnos pendientes.</p>
                )}
            </section>

            <section className="turnos-section">
                <h3>Turnos Confirmados</h3>
                {turnosConfirmados.length > 0 ? (
                    turnosConfirmados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
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

// 💡 5. Se eliminó la definición local de TurnoCard