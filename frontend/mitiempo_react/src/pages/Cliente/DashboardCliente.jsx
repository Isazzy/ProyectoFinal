// front/src/pages/Cliente/DashboardCliente.jsx
import React, { useEffect, useState } from "react";
import { getTurnos } from "../../api/turnos";

export default function DashboardCliente() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurnos = async () => {
      try {
        const data = await getTurnos(); 
       
        setTurnos(Array.isArray(data) ? data : data.results || []);
      } catch (error) {
        console.error("Error al cargar turnos:", error);
        setTurnos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTurnos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mis Turnos</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {turnos.length === 0 ? (
            <p>No tenés turnos.</p>
          ) : (
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

