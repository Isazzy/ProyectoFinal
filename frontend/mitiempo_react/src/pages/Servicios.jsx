import React, { useEffect, useState } from "react";
import { getServicios } from "../../src/api/servicios";
import "../CSS/serviciosPublicos.css";

import serviciosfondo from "../imagenes/serviciosfondo.jpg";
import serviciofondo2 from "../imagenes/serviciofondo2.jpg";

import Dropdown from "react-bootstrap/Dropdown";
import "bootstrap/dist/css/bootstrap.min.css";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await getServicios();
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

  const colores = [
    "Rubio platinado",
    "Castaño claro",
    "Negro profundo",
    "Rojo intenso",
    "Chocolate",
    "Balayage",
    "Mechas doradas",
    "Cobre",
  ];

  const lavados = [
    "Lavado detox con shampoo neutro",
    "Lavado hidratante con keratina",
    "Lavado anticaspa profesional",
    "Lavado con masaje capilar relajante",
    "Lavado con tratamiento nutritivo",
  ];

  const cortes = [
    "CORTE - $10.000 | 30M",
    "PEINADO - $10.000 | 30M",
    "CORTE + PEINADO - $18.000 | 45M",
  ];

  const bloqueEstilo = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "15px",
    borderRadius: "8px",
    color: "white",
    width: "220px",
  };

  const menuEstilo = {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    border: "none",
  };

  const itemEstilo = {
    color: "white",
    backgroundColor: "transparent",
  };

  return (
    <div>
      {/* 🔥 Sección 1 - Imagen principal sin caja */}
      <div
        style={{
          backgroundImage: `url(${serviciosfondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          position: "relative",
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

      {/* 🖼️ Sección 2 - Imagen secundaria con menús desplegables */}
      <div
        style={{
          backgroundImage: `url(${serviciofondo2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", zIndex: 2, width: "100%", height: "100%" }}>
          {/* Color - arriba izquierda */}
          <div style={{ position: "absolute", top: "40px", left: "40px" }}>
            <div style={bloqueEstilo}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px", color: "white" }}>Color</h3>
              <Dropdown>
                <Dropdown.Toggle
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    color: "white",
                  }}
                  id="dropdown-color"
                >
                  ▼
                </Dropdown.Toggle>
                <Dropdown.Menu style={menuEstilo}>
                  {colores.map((c, i) => (
                    <Dropdown.Item key={i} style={itemEstilo}>
                      {c}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Corte y Peinado - centro derecha */}
          <div style={{ position: "absolute", top: "50%", right: "40px", transform: "translateY(-50%)" }}>
            <div style={bloqueEstilo}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px", color: "white" }}>Corte y Peinado</h3>
              <Dropdown>
                <Dropdown.Toggle
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    color: "white",
                  }}
                  id="dropdown-cortes"
                >
                  ▼
                </Dropdown.Toggle>
                <Dropdown.Menu style={menuEstilo}>
                  {cortes.map((c, i) => (
                    <Dropdown.Item key={i} style={itemEstilo}>
                      {c}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Lavados - abajo izquierda */}
          <div style={{ position: "absolute", bottom: "40px", left: "40px" }}>
            <div style={bloqueEstilo}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px", color: "white" }}>Lavados</h3>
              <Dropdown>
                <Dropdown.Toggle
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    border: "none",
                    color: "white",
                  }}
                  id="dropdown-lavado"
                >
                  ▼
                </Dropdown.Toggle>
                <Dropdown.Menu style={menuEstilo}>
                  {lavados.map((l, i) => (
                    <Dropdown.Item key={i} style={itemEstilo}>
                      {l}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* 💅 Sección 3 - Grilla de servicios */}
      {!loading && servicios.length > 0 && (
        <div className="p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {servicios.map((s) => (
              <div key={s.id_serv} className="border rounded-lg p-4 shadow bg-white">
                {s.imagen && (
                  <img
                    src={`http://127.0.0.1:8000${s.imagen}`}
                    alt={s.nombre_serv}
                    className="w-full h-40 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="text-lg font-semibold text-pink-600">{s.nombre_serv}</h3>
                <p className="text-gray-700">{s.descripcion_serv}</p>
                <p className="font-bold mt-2 text-gray-900">${s.precio_serv}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Servicios;
