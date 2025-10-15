import React, { useState, useEffect } from "react";
import { getServicios } from "../../api/servicios";
import { getEmpleados } from "../../api/Usuarios";
import { fetchServicios, fetchUsuarios, fetchTurnos, createTurno } from "../../api/index";


export default function TurnoForm({ onTurnoCreado }) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [error, setError] = useState(null);

  // Cargar servicios y profesionales al montar el componente
  useEffect(() => {
    getServicios()
      .then((data) => {
        if (Array.isArray(data)) setServicios(data);
        else setServicios([]);
      })
      .catch(() => setError("Error al cargar los servicios."));

    getEmpleados()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProfesionales(res.data);
        } else {
          setProfesionales([]);
        }
      })
      .catch(() => setError("Error al cargar los profesionales."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("Debes iniciar sesión para sacar un turno.");
      return;
    }

    const nuevoTurno = {
      fecha_turno: fecha,
      hora_turno: hora,
      servicio: servicioId,
      profesional: profesionalId,
      estado_turno: "pendiente",
      cliente: user.id,
    };

    try {
      await createTurno(nuevoTurno);
      onTurnoCreado();
      setFecha("");
      setHora("");
      setServicioId("");
      setProfesionalId("");
    } catch (err) {
      console.error("Error al crear turno:", err);
      setError("No se pudo crear el turno. Intenta nuevamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Agendar Turno</h3>

      {error && <p style={styles.error}>{error}</p>}

      <label>Fecha:</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        required
      />

      <label>Hora:</label>
      <input
        type="time"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
        required
      />

      <label>Servicio:</label>
      <select
        value={servicioId}
        onChange={(e) => setServicioId(e.target.value)}
        required
      >
        <option value="">Seleccionar...</option>
        {servicios.map((s) => (
          <option key={s.id_serv} value={s.id_serv}>
            {s.nombre_serv} (${s.precio_serv})
          </option>
        ))}
      </select>

      <label>Profesional:</label>
      <select
        value={profesionalId}
        onChange={(e) => setProfesionalId(e.target.value)}
        required
      >
        <option value="">Seleccionar...</option>
        {profesionales.map((p) => (
          <option key={p.id} value={p.id}>
            {p.username} ({p.role})
          </option>
        ))}
      </select>

      <button type="submit" style={styles.button}>
        Agendar Turno
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: 320,
    background: "#f7f7f7",
    padding: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: 8,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: 14,
  },
};
