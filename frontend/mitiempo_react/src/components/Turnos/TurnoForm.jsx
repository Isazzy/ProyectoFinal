// front/src/componentesTurnos/TurnoForm.jsx
import React, {useState, useEffect} from "react";
import {getServicios} from "../../api/servicios";
import {createTurno} from "../../api/turnos"
//Crear o editar/eliminar un producto
export default function TurnoForm({onTurnoCreado}){
    const [fecha, serFecha] = useState ("");
    const [hora, setHora] = useState ("");
    const [servicioId, setServicioId] = useState("");
    const [servicios, setServicios] = useState ("");

    useEffect(() =>{
        getServicios().then(setServicios);
    },[]);

    const handleSubmit = async (e) =>{
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        const nuevoTurno = {
          fecha_turno: fecha,
          hora_turno: hora,
          estado_turno: "pendiente",
        };
        await createTurno(nuevoTurno);

        onTurnoCreado();
        setFecha("");
        setHora("");
        setServicioId("");
    };
    return (
    <form onSubmit={handleSubmit} style={styles.form}>
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

      <button type="submit" style={styles.button}>
        Agendar Turno
      </button>
    </form>
  );
}
const styles = {
  form: { display: "flex", flexDirection: "column", gap: 10, width: 250 },
  button: { backgroundColor: "#4CAF50", color: "white", padding: 8, border: "none", borderRadius: 4 },
};