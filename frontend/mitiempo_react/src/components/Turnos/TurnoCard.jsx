// front/src/componentesTurnos/TurnoCard.jsx
import React from "react";
//Muestra cada turno con su estado
export default function TurnoCard({turno}){
    return(
        <div style={StyleSheet.card}>
            <p><b>Fecha:</b> {turno.fecha_turno}</p>
            <p><b>Hora:</b> {turno.hora_turno}</p>
            <p><b>Estado:</b> {turno.estado_turno}</p>
            <p><b>Observaciones:</b> {turno.observaciones || "-"}</p>
        </div>
    )
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
};