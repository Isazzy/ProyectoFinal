// front/src/componentesTurnos/CrearTurno.jsx
import React, { useEffect, useState } from "react";
import { getServicios, crearTurno } from "../../api/turnos";

function CrearTurno() {
  const [servicios, setServicios] = useState([]);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    getServicios().then(setServicios);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearTurno(token, {
        id_cli: 1, // reemplazar con el ID del usuario logueado (puede obtenerse del token)
        fecha_turno: fecha,
        hora_turno: hora,
        observaciones: "",
      });
      alert("Turno creado con éxito");
    } catch {
      alert("Error al crear turno");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-turno">
      <h2>Reservar turno</h2>
      <label>Servicio</label>
      <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
        <option>Selecciona un servicio</option>
        {servicios.map((s) => (
          <option key={s.id_serv} value={s.id_serv}>
            {s.nombre_serv} (${s.precio_serv})
          </option>
        ))}
      </select>

      <label>Fecha</label>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

      <label>Hora</label>
      <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />

      <button type="submit">Confirmar turno</button>
    </form>
  );
}

export default CrearTurno;
