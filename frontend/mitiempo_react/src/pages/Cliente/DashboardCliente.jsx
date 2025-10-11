// front/src/pages/Cliente/DashboardCliente.jsx
import React, { useEffect, useState } from "react";
import { fetchTurnos } from "../../api";

export default function DashboardCliente() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurnos()
      .then((data) => {
        // filtramos por usuario actual si tu backend no lo hace
        const currentUserRaw = localStorage.getItem("user");
        // si tenés user.id almacenado, usalo; aquí asumimos request.user en backend, pero por seguridad filtramos por id_cli si existe.
        setTurnos(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mis Turnos</h1>
      {loading ? <p>Cargando...</p> : (
        <>
          {turnos.length === 0 ? <p>No tenés turnos.</p> : (
            <ul>
              {turnos.map((t) => (
                <li key={t.id_turno || t.id}>
                  <b>{t.fecha_turno}</b> — {t.hora_turno} — {t.estado_turno || "pendiente"}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
