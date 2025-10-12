// src/components/ServiciosList.jsx
import React, { useEffect, useState } from "react";
import { getServiciosPublicos } from "../api/servicios";

const ServiciosList = ({ onSelect }) => {
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServiciosPublicos()
      .then(setServicios)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!servicios.length) return <p>No hay servicios disponibles.</p>;

  return (
    <div>
      <h2>Servicios disponibles</h2>
      <ul>
        {servicios.map((serv) => (
          <li key={serv.id_serv} onClick={() => onSelect?.(serv)}>
            <strong>{serv.nombre_serv}</strong> - ${serv.precio_serv}
            <p>{serv.descripcion_serv}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiciosList;