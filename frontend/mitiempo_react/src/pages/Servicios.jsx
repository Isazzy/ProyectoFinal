// front/src/pages/Servicios.jsx
import React, { useEffect, useState } from "react";
import { fetchServicios } from "../api";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServicios().then(setServicios).catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Servicios</h1>
      {error && <p className="error">{error}</p>}
      <ul>
        {servicios.map((s) => (
          <li key={s.id_serv}>
            <b>{s.nombre_serv}</b> — ${s.precio_serv} — {s.duracion_serv || "duración no especificada"}
          </li>
        ))}
      </ul>
    </div>
  );
}
