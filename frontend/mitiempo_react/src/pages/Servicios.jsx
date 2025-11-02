// src/components/Servicios.jsx
import React, { useEffect, useState } from "react";
import { getServicios } from "../api/servicios";
import "../CSS/serviciosPublicos.css";

import serviciosfondo from "../imagenes/serviciosfondo.jpg";
import serviciofondo2 from "../imagenes/serviciofondo2.jpg";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await getServicios();
        
        // --- CORRECCIÓN ---
        // El backend ya filtra los servicios 'activos' para los clientes,
        // pero esta doble verificación (solo por 'activado') es segura.
        // Se eliminó la referencia a 'disponible_serv' que ya no existe.
        const activos = res.data.filter((s) => s.activado);
        
        setServicios(activos);
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  
  const serviciosPorTipo = servicios.reduce((grupos, serv) => {
    const tipo = serv.tipo_serv || "Sin categoría";
    if (!grupos[tipo]) grupos[tipo] = [];
    grupos[tipo].push(serv);
    return grupos;
  }, {});

  const bloqueEstilo = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "15px",
    borderRadius: "8px",
    color: "white",
    width: "700px",
    margin: "20px",
  };

  return (
    <div>
      {/* Sección 1 */}
      <div
        style={{
          backgroundImage: `url(${serviciosfondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "pink" }}>
          EXPERTA EN COLOR, CORTE Y CUIDADO CAPILAR
        </h1>
        <p style={{ fontSize: "1.5rem", marginTop: "10px", color: "pink" }}>
          Cada cabello tiene una historia. <br />
          Nosotros la transformamos en arte.
        </p>
      </div>

      
      {/* Sección 2 - Lista de Servicios */}
      <div
        style={{
          backgroundImage: `url(${serviciofondo2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          padding: "40px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {Object.keys(serviciosPorTipo).map((tipo) => (
          <div key={tipo} style={bloqueEstilo}>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>{tipo}</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {serviciosPorTipo[tipo].map((s) => (
                <li key={s.id_serv} style={{ marginBottom: "6px" }}>
                  
                  {/* --- MEJORA DE LEGIBILIDAD --- */}
                  {/* Usamos 'duracion_minutos' del serializer en lugar de 'duracion_serv' ("01:30:00") */}
                  {s.nombre_serv} - ${s.precio_serv} 
                  {s.duracion_minutos > 0 && ` - ~${s.duracion_minutos} min. Aprox`}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Sección 3 - Grilla general (Contenido pendiente) */}
      {!loading && servicios.length > 0 && (
        <div className="p-8 bg-white">
          {/* Aquí puedes agregar más contenido si es necesario */}
        </div>
      )}

      {loading && (
        <div className="text-center p-8 text-gray-500">Cargando servicios...</div>
      )}
    </div>
  );
}

export default Servicios;