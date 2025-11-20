// src/components/Turnos/TurnoCard.jsx
import React from "react";

// (Función auxiliar de formato de ProfilePage)
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m} min`;
};

export default function TurnoCard({ turno }) {
  const { start, servicios, profesional, estado_turno } = turno;
  
  const fecha = new Date(start);
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const horaFormateada = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });

  const duracionTotal = servicios?.reduce((total, s) => 
    total + (s.servicio?.duracion_minutos || 0), 0) || 0;
  
  const precioTotal = servicios?.reduce((total, s) =>
    total + parseFloat(s.servicio?.precio_serv || 0), 0) || 0;

  return (
    <div className={`turno-card estado-${estado_turno}`}>
      <div className="turno-card-header">
        <strong>{fechaFormateada} - {horaFormateada} hs</strong>
        <span className={`badge estado-${estado_turno}`}>
          {estado_turno}
        </span>
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
        <div className="turno-card-footer">
          <span>Duración: {formatDuration(duracionTotal)}</span>
          <span>Precio: ${precioTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}