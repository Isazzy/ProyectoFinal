import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Scissors, Star, Clock, MapPin, Phone, Instagram, Facebook } from "lucide-react";

import scroll1 from "../imagenes/manos1.jpg";
import scroll2 from "../imagenes/maquillaje1.jpg";
import scroll3 from "../imagenes/peinados1.jpg";
import fondo2 from "../imagenes/inicio2.jpg";
import peinado1 from "../imagenes/peinado1.jpg";
import peinado2 from "../imagenes/peinado2.jpg";
import peinado3 from "../imagenes/peinado3.jpg";
import peinado4 from "../imagenes/peinado4.jpg";
import fondo from "../imagenes/fondo.png";

export default function Nosotros() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const imagenes = [scroll1, scroll2, scroll3];

  // Carrusel automático
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const cambiarImagen = (direccion) => {
    if (direccion === "izquierda") {
      setIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
    } else {
      setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
    }
  };

  // Estilos organizados
  const styles = {
    seccion1: {
      minHeight: "100vh",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      overflow: "hidden",
    },
    fondoImagen: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5))",
      zIndex: 1,
    },
    flecha: {
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "2rem",
      background: "rgba(0,0,0,0.5)",
      color: "white",
      border: "none",
      padding: "15px 20px",
      cursor: "pointer",
      zIndex: 3,
      borderRadius: "50%",
      transition: "all 0.3s ease",
      backdropFilter: "blur(5px)",
    },
    puntitos: {
      position: "absolute",
      bottom: "40px",
      display: "flex",
      gap: "12px",
      zIndex: 3,
      left: "50%",
      transform: "translateX(-50%)",
    },
    punto: (activo) => ({
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      backgroundColor: activo ? "#f76c6c" : "white",
      opacity: activo ? 1 : 0.5,
      border: "2px solid #f76c6c",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: activo ? "scale(1.2)" : "scale(1)",
    }),
    heroContent: {
      textAlign: "center",
      zIndex: 2,
      padding: "20px",
      maxWidth: "800px",
    },
    seccion2: {
      minHeight: "100vh",
      backgroundImage: `url(${fondo})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      color: "white",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    seccion3: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, rgba(40,30,35,1) 0%, rgba(60,45,50,1) 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      position: "relative",
      padding: "80px 20px",
    },
    contenedorImagenes: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "30px",
      width: "90%",
      maxWidth: "1000px",
      marginTop: "40px",
      marginBottom: "40px",
    },
    imagenChica: {
      width: "100%",
      height: "280px",
      objectFit: "cover",
      borderRadius: "15px",
      boxShadow: "0 10px 30px rgba(247, 108, 108, 0.3)",
      transition: "transform 0.4s ease, box-shadow 0.4s ease",
    },
    textoCentro: {
      textAlign: "center",
      color: "white",
      padding: "20px",
      zIndex: 2,
      marginBottom: "30px",
    },
    boton: {
      backgroundColor: "#f76c6c",
      border: "none",
      padding: "15px 35px",
      borderRadius: "30px",
      color: "white",
      fontWeight: "bold",
      fontSize: "1.1rem",
      cursor: "pointer",
      marginTop: "20px",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(247, 108, 108, 0.4)",
      textTransform: "uppercase",
      letterSpacing: "1px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    beneficiosSeccion: {
      padding: "80px 20px",
      background: "linear-gradient(180deg, rgba(35,35,35,1) 0%, rgba(40,30,35,1) 100%)",
      color: "white",
      position: "relative",
    },
    divisorSuave: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100px",
      background: "linear-gradient(to bottom, transparent, rgba(40,30,35,0.3))",
      pointerEvents: "none",
    },
    beneficiosGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "40px",
      maxWidth: "1200px",
      margin: "0 auto",
      marginTop: "50px",
    },
    beneficioCard: {
      textAlign: "center",
      padding: "30px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "15px",
      transition: "all 0.3s ease",
      border: "1px solid rgba(247, 108, 108, 0.2)",
    },
    footer: {
      background: "linear-gradient(180deg, rgba(22,22,22,1) 0%, rgba(10,10,10,1) 100%)",
      padding: "60px 20px 30px",
      color: "white",
    },
    footerGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "40px",
      maxWidth: "1200px",
      margin: "0 auto 40px",
    },
    socialIcon: {
      fontSize: "1.5rem",
      margin: "0 10px",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
  };

  return (
    <>
      {/* Sección 1 - Hero con Carrusel Automático */}
      <div style={styles.seccion1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              ...styles.fondoImagen,
              backgroundImage: `url(${imagenes[index]})`,
            }}
          />
        </AnimatePresence>

        <div style={styles.overlay} />

        <motion.button
          style={{ ...styles.flecha, left: "20px" }}
          onClick={() => cambiarImagen("izquierda")}
          whileHover={{ scale: 1.1, background: "rgba(247, 108, 108, 0.8)" }}
          whileTap={{ scale: 0.9 }}
        >
          ❮
        </motion.button>

        <motion.div
          style={styles.heroContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <motion.h1
            style={{ fontSize: "3.5rem", marginBottom: "20px", textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Belleza que Transforma
          </motion.h1>
          <motion.p
            style={{ fontSize: "1.3rem", marginBottom: "30px", textShadow: "1px 1px 4px rgba(0,0,0,0.7)" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Expertos en peluquería y estética profesional
          </motion.p>
          <motion.button
            style={styles.boton}
            onClick={() => navigate("/turnos")}
            whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(247, 108, 108, 0.6)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Calendar style={{ display: "inline", marginRight: "10px" }} size={20} />
            Reservar Turno Ahora
          </motion.button>
        </motion.div>

        <motion.button
          style={{ ...styles.flecha, right: "20px" }}
          onClick={() => cambiarImagen("derecha")}
          whileHover={{ scale: 1.1, background: "rgba(247, 108, 108, 0.8)" }}
          whileTap={{ scale: 0.9 }}
        >
          ❯
        </motion.button>

        <div style={styles.puntitos}>
          {imagenes.map((_, i) => (
            <motion.div
              key={i}
              style={styles.punto(i === index)}
              onClick={() => setIndex(i)}
              whileHover={{ scale: 1.3 }}
            />
          ))}
        </div>
      </div>

      {/* Sección 2 - Call to Action con fondo personalizado */}
      <motion.div
        style={{...styles.seccion2, position: "relative"}}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div style={styles.overlay} />
        <motion.div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "40px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(247, 108, 108, 0.3)",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: "2.8rem", color: "white", marginBottom: "20px" }}>
            ¡Tu look soñado <br /> empieza con un turno!
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "30px", opacity: 0.9 }}>
            Agenda tu cita en minutos y transforma tu estilo
          </p>
          <motion.button
            style={styles.boton}
            onClick={() => navigate("/turnos")}
            whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(247, 108, 108, 0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar style={{ display: "inline", marginRight: "10px" }} size={20} />
            Reservá tu turno
          </motion.button>
        </motion.div>
        <div style={styles.divisorSuave} />
      </motion.div>

      {/* Sección de Beneficios */}
      <div style={{...styles.beneficiosSeccion, position: "relative"}}>
        <motion.h2
          style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "20px" }}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          ¿Por qué elegirnos?
        </motion.h2>
        <motion.p
          style={{ textAlign: "center", fontSize: "1.1rem", opacity: 0.8, marginBottom: "40px" }}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          Calidad, experiencia y atención personalizada
        </motion.p>
        <div style={styles.beneficiosGrid}>
          {[
            { icon: <Scissors size={40} />, titulo: "Profesionales Expertos", desc: "Equipo altamente capacitado con años de experiencia" },
            { icon: <Star size={40} />, titulo: "Calidad Premium", desc: "Productos de primera calidad para resultados excepcionales" },
            { icon: <Clock size={40} />, titulo: "Horarios Flexibles", desc: "Turnos adaptados a tu disponibilidad" },
            { icon: <MapPin size={40} />, titulo: "Ubicación Ideal", desc: "Fácil acceso y estacionamiento disponible" },
          ].map((beneficio, idx) => (
            <motion.div
              key={idx}
              style={styles.beneficioCard}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                background: "rgba(247, 108, 108, 0.1)",
                borderColor: "#f76c6c",
              }}
            >
              <motion.div
                style={{ color: "#f76c6c", marginBottom: "20px" }}
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {beneficio.icon}
              </motion.div>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>{beneficio.titulo}</h3>
              <p style={{ opacity: 0.8 }}>{beneficio.desc}</p>
            </motion.div>
          ))}
        </div>
        <div style={styles.divisorSuave} />
      </div>

      {/* Sección 3 - Servicios con imágenes mejorada */}
      <motion.div
        style={styles.seccion3}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          style={styles.textoCentro}
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h1 style={{ fontSize: "2.8rem", lineHeight: "1.2", marginBottom: "30px" }}>
            CONOCÉ TODOS NUESTROS SERVICIOS
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "20px" }}>
            Descubrí la variedad de tratamientos que tenemos para vos
          </p>
        </motion.div>

        <motion.div
          style={{ textAlign: "center", marginBottom: "50px" }}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.button
            style={styles.boton}
            onClick={() => navigate("/servicios")}
            whileHover={{ scale: 1.05, boxShadow: "0 6px 25px rgba(247, 108, 108, 0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Scissors style={{ display: "inline", marginRight: "10px" }} size={20} />
            SERVICIOS
          </motion.button>
        </motion.div>

        <div style={styles.contenedorImagenes}>
          {[peinado1, peinado2, peinado3, peinado4].map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src={img}
                alt={`Peinado ${idx + 1}`}
                style={styles.imagenChica}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 15px 40px rgba(247, 108, 108, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 10px 30px rgba(247, 108, 108, 0.3)";
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 style={{ color: "#f76c6c", marginBottom: "15px" }}>Contacto</h3>
            <p style={{ marginBottom: "10px" }}>
              <Phone size={16} style={{ display: "inline", marginRight: "10px" }} />
              +54 11 1234-5678
            </p>
            <p style={{ marginBottom: "10px" }}>
              <MapPin size={16} style={{ display: "inline", marginRight: "10px" }} />
              Salta, Argentina
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 style={{ color: "#f76c6c", marginBottom: "15px" }}>Horarios</h3>
            <p>Lunes a Viernes: 9:00 - 18:00</p>
            <p>Sábados: 9:00 - 18:00</p>
            <p>Domingos: Cerrado</p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 style={{ color: "#f76c6c", marginBottom: "15px" }}>Síguenos</h3>
            <div>
              <Instagram style={{ ...styles.socialIcon, color: "white" }} />
              <Facebook style={{ ...styles.socialIcon, color: "white" }} />
            </div>
          </motion.div>
        </div>

        <div style={{ textAlign: "center", paddingTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ opacity: 0.6 }}>© 2025 Todos los derechos reservados</p>
        </div>
      </footer>
    </>
  );
}