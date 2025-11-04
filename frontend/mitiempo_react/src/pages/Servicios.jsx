import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Clock, DollarSign, Sparkles, Phone, MapPin, Instagram, Facebook, CheckCircle } from "lucide-react";
import { getServicios } from "../api/servicios";

import serviciosfondo from "../imagenes/serviciosfondo.jpg";
import serviciofondo2 from "../imagenes/serviciofondo2.jpg";

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

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

  const serviciosPorTipo = servicios.reduce((grupos, serv) => {
    const tipo = serv.tipo_serv || "Sin categoría";
    if (!grupos[tipo]) grupos[tipo] = [];
    grupos[tipo].push(serv);
    return grupos;
  }, {});

  // Estilos organizados
  const styles = {
    heroSeccion: {
      backgroundImage: `url(${serviciosfondo})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      position: "relative",
      padding: "20px",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))",
      zIndex: 1,
    },
    heroContent: {
      position: "relative",
      zIndex: 2,
      maxWidth: "900px",
    },
    serviciosSeccion: {
      backgroundImage: `url(${serviciofondo2})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      padding: "80px 20px",
      position: "relative",
    },
    categoriaCard: {
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(10px)",
      padding: "30px",
      borderRadius: "20px",
      border: "2px solid rgba(247, 108, 108, 0.3)",
      color: "white",
      transition: "all 0.3s ease",
      cursor: "pointer",
      minWidth: "320px",
      maxWidth: "450px",
    },
    servicioItem: {
      background: "rgba(255, 255, 255, 0.1)",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "12px",
      transition: "all 0.3s ease",
      border: "1px solid rgba(247, 108, 108, 0.2)",
    },
    beneficiosSeccion: {
      background: "linear-gradient(180deg, rgba(35,35,35,1) 0%, rgba(40,30,35,1) 100%)",
      padding: "80px 20px",
      color: "white",
    },
    beneficiosGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "30px",
      maxWidth: "1200px",
      margin: "50px auto 0",
    },
    beneficioCard: {
      background: "rgba(255,255,255,0.05)",
      padding: "30px",
      borderRadius: "15px",
      textAlign: "center",
      border: "1px solid rgba(247, 108, 108, 0.2)",
      transition: "all 0.3s ease",
    },
    footer: {
      background: "linear-gradient(180deg, rgba(40,30,35,1) 0%, rgba(10,10,10,1) 100%)",
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
      display: "inline-block",
    },
    divisorSuave: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100px",
      background: "linear-gradient(to bottom, transparent, rgba(35,35,35,0.5))",
      pointerEvents: "none",
    },
  };

  const iconosPorCategoria = {
    "Corte": <Scissors size={30} />,
    "Color": <Sparkles size={30} />,
    "Tratamiento": <CheckCircle size={30} />,
    "Peinado": <Scissors size={30} />,
    "Sin categoría": <Scissors size={30} />,
  };

  return (
    <div>
      {/* Sección Hero */}
      <div style={styles.heroSeccion}>
        <div style={styles.overlay} />
        <motion.div
          style={styles.heroContent}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              color: "#f76c6c",
              textShadow: "2px 2px 10px rgba(0,0,0,0.8)",
              marginBottom: "20px",
            }}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            EXPERTA EN COLOR, CORTE Y CUIDADO CAPILAR
          </motion.h1>
          <motion.p
            style={{
              fontSize: "1.5rem",
              color: "white",
              textShadow: "1px 1px 5px rgba(0,0,0,0.7)",
              lineHeight: "1.6",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Cada cabello tiene una historia. <br />
            Nosotros la transformamos en arte.
          </motion.p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
          >
            <Sparkles
              size={60}
              color="#f76c6c"
              style={{ marginTop: "30px" }}
            />
          </motion.div>
        </motion.div>
        <div style={styles.divisorSuave} />
      </div>

      {/* Sección de Servicios */}
      <div style={styles.serviciosSeccion}>
        <div style={styles.overlay} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <motion.h2
            style={{
              fontSize: "2.8rem",
              textAlign: "center",
              color: "#f76c6c",
              marginBottom: "20px",
              textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
            }}
            initial={{ y: -50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Nuestros Servicios
          </motion.h2>
          <motion.p
            style={{
              fontSize: "1.2rem",
              textAlign: "center",
              color: "white",
              marginBottom: "60px",
              textShadow: "1px 1px 4px rgba(0,0,0,0.7)",
            }}
            initial={{ y: -30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Descubrí toda nuestra oferta de tratamientos profesionales
          </motion.p>

          {loading ? (
            <motion.div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#f76c6c",
                fontSize: "1.5rem",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                <Scissors size={50} />
              </motion.div>
              <p style={{ marginTop: "20px" }}>Cargando servicios...</p>
            </motion.div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "30px",
                maxWidth: "1400px",
                margin: "0 auto",
              }}
            >
              <AnimatePresence>
                {Object.keys(serviciosPorTipo).map((tipo, idx) => (
                  <motion.div
                    key={tipo}
                    style={styles.categoriaCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    viewport={{ once: true, amount: 0.3 }}
                    whileHover={{
                      scale: 1.02,
                      borderColor: "#f76c6c",
                      boxShadow: "0 10px 30px rgba(247, 108, 108, 0.3)",
                    }}
                    onClick={() =>
                      setCategoriaSeleccionada(
                        categoriaSeleccionada === tipo ? null : tipo
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                        gap: "15px",
                      }}
                    >
                      <div style={{ color: "#f76c6c" }}>
                        {iconosPorCategoria[tipo] || iconosPorCategoria["Sin categoría"]}
                      </div>
                      <h3 style={{ fontSize: "1.8rem", margin: 0 }}>{tipo}</h3>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{
                        height: categoriaSeleccionada === tipo ? "auto" : 0,
                        opacity: categoriaSeleccionada === tipo ? 1 : 0,
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ paddingTop: "15px" }}>
                        {serviciosPorTipo[tipo].map((s) => (
                          <motion.div
                            key={s.id_serv}
                            style={styles.servicioItem}
                            whileHover={{
                              background: "rgba(247, 108, 108, 0.2)",
                              transform: "translateX(5px)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "10px",
                              }}
                            >
                              <div style={{ flex: 1, minWidth: "150px" }}>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    fontSize: "1.1rem",
                                    marginBottom: "5px",
                                  }}
                                >
                                  {s.nombre_serv}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "15px",
                                    fontSize: "0.9rem",
                                    opacity: 0.8,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                    }}
                                  >
                                    <DollarSign size={16} />$
                                    {s.precio_serv}
                                  </span>
                                  {s.duracion_minutos > 0 && (
                                    <span
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                      }}
                                    >
                                      <Clock size={16} />
                                      ~{s.duracion_minutos} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {categoriaSeleccionada !== tipo && (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "15px",
                          color: "#f76c6c",
                          fontSize: "0.9rem",
                        }}
                      >
                        {serviciosPorTipo[tipo].length} servicio
                        {serviciosPorTipo[tipo].length !== 1 ? "s" : ""} •
                        Click para ver detalles
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div style={styles.divisorSuave} />
      </div>

      {/* Sección de Beneficios */}
      <div style={styles.beneficiosSeccion}>
        <motion.h2
          style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "20px" }}
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          ¿Por qué elegir nuestros servicios?
        </motion.h2>
        <motion.p
          style={{
            textAlign: "center",
            fontSize: "1.1rem",
            opacity: 0.8,
            marginBottom: "40px",
          }}
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          Calidad, profesionalismo y resultados garantizados
        </motion.p>
        <div style={styles.beneficiosGrid}>
          {[
            {
              icon: <CheckCircle size={40} />,
              titulo: "Productos Premium",
              desc: "Trabajamos con las mejores marcas del mercado",
            },
            {
              icon: <Scissors size={40} />,
              titulo: "Profesionales Certificados",
              desc: "Equipo capacitado en técnicas actualizadas",
            },
            {
              icon: <Sparkles size={40} />,
              titulo: "Resultados Duraderos",
              desc: "Tratamientos que cuidan y embellecen tu cabello",
            },
            {
              icon: <Clock size={40} />,
              titulo: "Atención Personalizada",
              desc: "Asesoramiento adaptado a tus necesidades",
            },
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
              <h3 style={{ fontSize: "1.4rem", marginBottom: "10px" }}>
                {beneficio.titulo}
              </h3>
              <p style={{ opacity: 0.8 }}>{beneficio.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

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
              Buenos Aires, Argentina
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 style={{ color: "#f76c6c", marginBottom: "15px" }}>Horarios</h3>
            <p>Lunes a Viernes: 9:00 - 20:00</p>
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
              <motion.div
                style={styles.socialIcon}
                whileHover={{ scale: 1.2, color: "#f76c6c" }}
              >
                <Instagram />
              </motion.div>
              <motion.div
                style={styles.socialIcon}
                whileHover={{ scale: 1.2, color: "#f76c6c" }}
              >
                <Facebook />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div
          style={{
            textAlign: "center",
            paddingTop: "30px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p style={{ opacity: 0.6 }}>© 2025 Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default Servicios;