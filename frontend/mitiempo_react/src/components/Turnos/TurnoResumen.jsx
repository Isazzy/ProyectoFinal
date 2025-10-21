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

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Confirmar Turno</h3>

      <div style={styles.infoGroup}>
        <p>
          <strong>Servicio:</strong> {resumen.servicioName}
        </p>
        <p>
          <strong>Profesional:</strong> {resumen.profName}
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(resumen.fecha).toLocaleDateString("es-AR")}
        </p>
        <p>
          <strong>Hora:</strong> {resumen.hora}
        </p>
        {resumen.precio && (
          <p>
            <strong>Precio:</strong> ${resumen.precio}
          </p>
        )}
        {resumen.duracion && (
          <p>
            <strong>Duración:</strong> {formatDuration(resumen.duracion)}
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
  },
  btnConfirm: {
    background: "#4CAF50",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
