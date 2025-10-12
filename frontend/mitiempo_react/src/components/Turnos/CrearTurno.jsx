// src/components/turnos/CrearTurno.jsx
import React, { useEffect, useState } from "react";
import { getServiciosPublicos } from "../../api/servicios";
import { createTurno, getServicios } from "../../api/turnos";

// ✅ Función para obtener el user_id desde el JWT
function getUserIdFromToken() {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload.user_id || decodedPayload.id || null;
  } catch (error) {
    console.error("Error decodificando token:", error);
    return null;
  }
}

function CrearTurno({ servicioPreseleccionado = null }) {
  const [servicios, setServicios] = useState(servicioPreseleccionado?.id_serv || "");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    getServiciosPublicos()
      .then(setServicios)
      .catch(() => setMensaje("Error al cargar los servicios"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const userId = getUserIdFromToken();

    if (!token || !userId) {
      alert("Debe iniciar sesión para reservar un turno");
      return;
    }

    try {
      await createTurno(token, {
        id_cli: userId,
        fecha_turno: fecha,
        hora_turno: hora,
        observaciones: "",
        id_serv: servicio,
      });
      setMensaje("✅ Turno creado con éxito");
      // limpiar campos
      setFecha("");
      setHora("");
      setServicio("");
    } catch (error) {
      console.error(error);
      const errText = await error.response?.text?.();
      setMensaje("❌ " + (errText || "Error al crear el turno"));
      setMensaje("❌ Error al crear el turno");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-turno">
      <h2>Reservar turno</h2>

      {mensaje && <p>{mensaje}</p>}

      <label>Servicio:</label>
      <select value={servicio} onChange={(e) => setServicio(e.target.value)} required>
        <option value="">Selecciona un servicio</option>
        {servicios.map((s) => (
          <option key={s.id_serv} value={s.id_serv}>
            {s.nombre_serv} (${s.precio_serv})
          </option>
        ))}
      </select>

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

      <button type="submit">Confirmar turno</button>
    </form>
  );
}

export default CrearTurno;
