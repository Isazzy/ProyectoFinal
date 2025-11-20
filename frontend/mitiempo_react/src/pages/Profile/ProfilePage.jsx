// src/pages/Profile/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { getTurnos } from "../../api/turnos"; // Usa la misma API
import { useAuth } from "../../Context/AuthContext";
import TurnoCard from "../../components/Turnos/TurnoCard"; // Importa el card
import "../../CSS/ProfilePage.css"; // CSS para esta página

export default function ProfilePage() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Obtener el ID del cliente

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Filtramos por el ID del cliente logueado
    getTurnos({ id_cli: user.id })
      .then((response) => {
        // Ordena por fecha, más nuevos primero
        const sortedTurnos = response.data.sort((a, b) => 
          new Date(b.start) - new Date(a.start)
        );
        setTurnos(sortedTurnos);
      })
      .catch((err) => {
        setError("Error al cargar tus turnos.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Filtramos los turnos
  const turnosPendientes = turnos.filter(t => t.estado_turno === 'pendiente');
  const turnosConfirmados = turnos.filter(t => t.estado_turno === 'confirmado');
  const turnosPasados = turnos.filter(t => ['cancelado', 'completado'].includes(t.estado_turno));

  return (
    <div className="app-container profile-page">
      <div className="admin-page-header">
        <h2>Mis Turnos</h2>
      </div>

      {loading && <p>Cargando turnos...</p>}
      {error && <p className="message error">{error}</p>}

      <section className="turnos-section">
        <h3>Próximos Turnos (Pendientes)</h3>
        {turnosPendientes.length > 0 ? (
          turnosPendientes.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
        ) : (
          !loading && <p className="empty-message">No tienes turnos pendientes de confirmación.</p>
        )}
      </section>

      <section className="turnos-section">
        <h3>Próximos Turnos (Confirmados)</h3>
        {turnosConfirmados.length > 0 ? (
          turnosConfirmados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
        ) : (
          !loading && <p className="empty-message">No tienes turnos confirmados.</p>
        )}
      </section>
      
      <section className="turnos-section">
        <h3>Historial de Turnos</h3>
        {turnosPasados.length > 0 ? (
          turnosPasados.map(turno => <TurnoCard key={turno.id_turno} turno={turno} />)
        ) : (
          !loading && <p className="empty-message">No tienes historial de turnos.</p>
        )}
      </section>
    </div>
  );
}