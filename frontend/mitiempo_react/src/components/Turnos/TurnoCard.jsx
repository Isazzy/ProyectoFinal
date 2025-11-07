// front/src/components/Turnos/TurnoCard.jsx
import React from "react";

// Helper (puedes moverlo a un archivo utils.js si lo prefieres)
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m} min`;
};

export default function TurnoCard({ turno }) {
  const { 
    fecha_hora_inicio, 
    servicios_asignados,
    estado, 
    duracion_total_minutos 
  } = turno;
  
  const fecha = new Date(fecha_hora_inicio);
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const horaFormateada = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });

  const duracionTotal = duracion_total_minutos || 0;
  const precioTotal = servicios_asignados?.reduce((total, item) =>
    total + parseFloat(item.servicio?.precio_serv || 0), 0) || 0;

  // 💡 Este JSX coincide con las clases de App.css
  return (
    <div className={`turno-card estado-${estado}`}>
      <div className="turno-card-header">
        <strong>{fechaFormateada} - {horaFormateada} hs</strong>
        <span className="turno-estado-badge">
          {estado}
        </span>
      </div>

      <div className="turno-card-body">
        <p>
          <strong>Servicios: </strong>
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