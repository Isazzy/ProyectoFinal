import React, { useEffect, useState } from "react";
import { getServicios } from "../../src/api/servicios";
import "../CSS/serviciosPublicos.css"

function Servicios() {
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await getServicios();
        // mostrar solo los activados
        const activos = res.data.filter((s) => s.activado);
        setServicios(activos);
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      }
    };
    fetchServicios();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Nuestros Servicios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {servicios.map((s) => (
          <div key={s.id_serv} className="border rounded-lg p-4 shadow">
            {s.imagen && (
              <img
                src={`http://127.0.0.1:8000${s.imagen}`}
                alt={s.nombre_serv}
                className="w-full h-40 object-cover mb-2"
              />
            )}
            <h3 className="text-lg font-semibold">{s.nombre_serv}</h3>
            <p>{s.descripcion_serv}</p>
            <p className="font-bold mt-2">${s.precio_serv}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Servicios;
