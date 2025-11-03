// src/components/Turnos/TurnoCard.jsx
import React from "react";

// (Función auxiliar de formato)
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m} min`;
};

export default function TurnoCard({ turno }) {
  // --- CAMBIO ---
  // Desestructuramos los nuevos campos del serializer
  const { 
    fecha_hora_inicio, 
    servicios_asignados, // Reemplaza a 'servicios'
    estado, // Reemplaza a 'estado_turno'
    duracion_total_minutos // Valor pre-calculado
  } = turno;
  
  // Usamos el nuevo campo de fecha
  const fecha = new Date(fecha_hora_inicio);

  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const horaFormateada = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });

  // --- CAMBIO ---
  // La duración ya viene calculada desde el backend
  const duracionTotal = duracion_total_minutos || 0;
  
  // --- CAMBIO ---
  // El precio se calcula usando el nuevo array 'servicios_asignados'
  const precioTotal = servicios_asignados?.reduce((total, item) =>
    total + parseFloat(item.servicio?.precio_serv || 0), 0) || 0;

  return (
    // --- CAMBIO ---
    <div className={`turno-card estado-${estado}`}>
      <div className="turno-card-header">
        <strong>{fechaFormateada} - {horaFormateada} hs</strong>
        {/* --- CAMBIO --- */}
        <span className={`badge estado-${estado}`}>
          {estado}
        </span>
      </div>
      <div className="turno-card-body">
        <p>
          <strong>Servicios: </strong>
          {/* --- CAMBIO --- */}
          {servicios_asignados.map(item => item.servicio.nombre_serv).join(', ')}
        </p>
        <div className="turno-card-footer">
          <span>Duración: {formatDuration(duracionTotal)}</span>
          <span>Precio: ${precioTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}