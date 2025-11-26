// src/components/Booking/SeleccionHora.jsx
import React from "react";
import "./SeleccionHora.css";

export default function SeleccionHora({ horariosDisponibles, horarioActual, onSelect }) {

  return (
    <div className="horarios-container">
      {horariosDisponibles.map(slot => {

        const { hora, estado } = slot;

        const seleccionado = hora === horarioActual;
        const disponible = estado === "disponible";
        const ocupado = estado === "ocupado";
        const pasado = estado === "pasado";

        return (
          <button
            key={hora}
            className={`
              hora-btn
              ${seleccionado ? "seleccionado" : ""}
              ${ocupado ? "ocupado" : ""}
              ${pasado ? "pasado" : ""}
            `}
            disabled={!disponible}
            onClick={() => disponible && onSelect(hora)}
          >
            {hora}
          </button>
        );
      })}
    </div>
  );
}
