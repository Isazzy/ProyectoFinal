// src/components/TurnoResumen.jsx
import React from "react";

export default function TurnoResumen({ resumen, onBack, onConfirm, saving }) {
  if (!resumen) return null;

  // Función para formatear duración (de "01:30:00" → "1h 30m")
  const formatDuration = (duracion) => {
    if (!duracion) return "-";
    const [h, m, s] = duracion.split(":").map(Number);
    let result = "";
    if (h) result += `${h}h `;
    if (m) result += `${m}m`;
    return result.trim() || `${s}s`;
  };

  // Total precio y duración si hay varios servicios
  const totalPrecio = Array.isArray(resumen.servicios)
    ? resumen.servicios.reduce((acc, s) => acc + (s.precio_serv || 0), 0)
    : resumen.precio;

  const totalDuracion = Array.isArray(resumen.servicios)
    ? resumen.servicios
        .map((s) => s.duracion_serv)
        .filter(Boolean)
        .reduce((acc, d) => {
          const [h, m, s] = d.split(":").map(Number);
          return acc + h * 60 + m + s / 60;
        }, 0)
    : resumen.duracion;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Confirmar Turno</h3>

      <div style={styles.infoGroup}>
        <p>
          <strong>Servicios:</strong>{" "}
          {Array.isArray(resumen.servicios)
            ? resumen.servicios.map((s) => s.nombre_serv).join(", ")
            : resumen.servicioName}
        </p>
        <p>
          <strong>Profesional:</strong> {resumen.profName}
        </p>
        <p>
          <strong>Fecha:</strong> {resumen.fecha}
        </p>
        <p>
          <strong>Hora:</strong> {resumen.hora}
        </p>
        {totalPrecio && (
          <p>
            <strong>Total:</strong> ${totalPrecio}
          </p>
        )}
        {totalDuracion && (
          <p>
            <strong>Duración:</strong> {Math.floor(totalDuracion / 60)}h{" "}
            {Math.round(totalDuracion % 60)}m
          </p>
        )}
      </div>

      <div style={styles.buttons}>
        <button onClick={onBack} style={styles.btnBack}>
          Volver
        </button>
        <button
          onClick={onConfirm}
          disabled={saving}
          style={styles.btnConfirm}
        >
          {saving ? "Guardando..." : "Confirmar turno"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    background: "#fff",
    maxWidth: "400px",
    margin: "20px auto",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
  },
  infoGroup: {
    lineHeight: "1.8",
    fontSize: "1rem",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  btnBack: {
    background: "#ccc",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.2s",
  },
  btnConfirm: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.2s",
  },
};
