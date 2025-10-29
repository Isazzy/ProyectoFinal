import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import scroll1 from "../imagenes/scroll1.jpg";
import scroll2 from "../imagenes/scroll2.jpg";
import scroll3 from "../imagenes/scroll3.jpg";
import fondo2 from "../imagenes/inicio2.jpg";
import peinado1 from "../imagenes/peinado1.jpg";
import peinado2 from "../imagenes/peinado2.jpg";
import peinado3 from "../imagenes/peinado3.jpg";
import peinado4 from "../imagenes/peinado4.jpg";

import SplitText from "../components/texto_anim/SplitText";

export default function Nosotros() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const imagenes = [scroll1, scroll2, scroll3];

  const cambiarImagen = (direccion) => {
    if (direccion === "izquierda") {
      setIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
    } else {
      setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
    }
  };

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  const seccion1 = {
    minHeight: "100vh",
    backgroundImage: `url(${imagenes[index]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "white",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textShadow: "1px 1px 4px rgba(0, 0, 0, 0.7)",
  };

  const flecha = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "2rem",
    background: "rgba(0,0,0,0.4)",
    color: "white",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    zIndex: 2,
  };

  const puntitos = {
    position: "absolute",
    bottom: "20px",
    display: "flex",
    gap: "10px",
    zIndex: 2,
    left: "50%",
    transform: "translateX(-50%)",
  };

  const punto = (activo) => ({
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: activo ? "#f76c6c" : "white",
    opacity: activo ? 1 : 0.5,
    border: "1px solid #f76c6c",
    cursor: "pointer",
  });

  const boton = {
    backgroundColor: "#f76c6c",
    border: "none",
    padding: "10px 25px",
    borderRadius: "5px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  };

  const seccion2 = {
    minHeight: "100vh",
    backgroundImage: `url(${fondo2})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    color: "white",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const seccion3 = {
    minHeight: "100vh",
    backgroundColor: "rgba(22,22,22,1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    position: "relative",
  };

  const contenedorImagenes = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    position: "relative",
    flexWrap: "wrap",
  };

  const imagenChica = {
    width: "200px",
    height: "250px",
    objectFit: "cover",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(255, 253, 253, 1)",
    margin: "10px",
  };

  const textoCentro = {
    textAlign: "center",
    color: "white",
    padding: "20px",
    zIndex: 2,
  };



  return (
    <>
      {/* Sección 1 - Carrusel manual con fondo */}
      <div style={seccion1}>
        <button style={{ ...flecha, left: "20px" }} onClick={() => cambiarImagen("izquierda")}>
          ❮
        </button>
        <div style={{ textAlign: "center", zIndex: 2 }}>
          <h1 style={{ fontSize: "3rem" }}></h1>
          <p style={{ fontSize: "1.5rem" }}></p>
        </div>
        <button style={{ ...flecha, right: "20px" }} onClick={() => cambiarImagen("derecha")}>
          ❯
        </button>

        <div style={puntitos}>
          {imagenes.map((_, i) => (
            <div key={i} style={punto(i === index)} onClick={() => setIndex(i)} />
          ))}
        </div>
      </div>

      {/* Sección 2 - Cartel centrado con botón de turnos */}
      <div style={seccion2}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 2,
            textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", color: "white" }}>
            
              <SplitText
                  text="¡Tu look soñado, empieza con un turno!"
                  className="text-2xl font-semibold text-center"
                  delay={100}
                  duration={0.6}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
              />
          </h1>
          <button style={boton} onClick={() => navigate("/turnos")}>
            Reservá tu turno
          </button>
        </div>
      </div>

      {/* Sección 3 - Fondo negro con botón de servicios */}
      <div style={seccion3}>
        <div style={contenedorImagenes}>
          <img src={peinado1} alt="Peinado 1" style={imagenChica} />
          <img src={peinado2} alt="Peinado 2" style={imagenChica} />

          <div style={textoCentro}>
            <h1
              style={{
                fontSize: "2.5rem",
                lineHeight: "1.2",
                color: "#ffffff",
              }}
            >
              <SplitText
                  text="CONOCÉ TODOS NUESTROS SERVICIOS"
                  className="text-2xl font-semibold text-center"
                  delay={100}
                  duration={0.5}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                  onLetterAnimationComplete={handleAnimationComplete}
              />
              
            </h1>
            <button style={boton} onClick={() => navigate("/servicios")}>
              SERVICIOS
            </button>
          </div>

          <img src={peinado3} alt="Peinado 3" style={imagenChica} />
          <img src={peinado4} alt="Peinado 4" style={imagenChica} />
        </div>
      </div>
    </>
  );
}
