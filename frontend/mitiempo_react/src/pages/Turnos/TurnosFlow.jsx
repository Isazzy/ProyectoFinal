// front/src/pages/Turnos/TurnosFlow.jsx
import React, { useState, useEffect } from "react";
import turnosApi from "../../api/turnos";
import * as serviciosApi from "../../api/servicios"; 
import TurnoResumen from "../../components/Turnos/TurnoResumen";
import axios from "axios";

export default function TurnosFlow() {
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar servicios y profesionales desde endpoints públicos
 useEffect(() => {
  const fetchData = async () => {
    try {
      const servRes = await serviciosApi.getServicios();
      console.log("Servicios:", servRes.data);
      setServicios(servRes.data);

      const profRes = await axios.get("http://127.0.0.1:8000/api/usuarios/profesionales/");
      console.log("Profesionales:", profRes.data);
      setProfesionales(profRes.data);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };
  fetchData();
}, []);

  const onConfirm = async () => {
    setSaving(true);
    try {
      const turnoData = {
        id_serv: selectedService.id_serv,
        id_prof: selectedProfessional.id,
        fecha_turno: selectedDate,
        hora_turno: selectedTime,
        estado_turno: "pendiente",
      };
      console.log("Payload turno enviado:", turnoData);
      await turnosApi.createTurno(turnoData);
      alert("Turno creado correctamente");

      // Resetear flujo
      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error("Error creando turno:", error);
      alert("Error al crear el turno");
    } finally {
      setSaving(false);
    }
  };

  // Agrupar servicios por tipo_serv
  const serviciosPorCategoria = servicios.reduce((acc, serv) => {
    if (!acc[serv.tipo_serv]) acc[serv.tipo_serv] = [];
    acc[serv.tipo_serv].push(serv);
    return acc;
  }, {});

  // --- Paso 1: Elegir servicio ---
  if (step === 1)
    return (
      <div className="turno-step">
        <h2>Elegí un servicio</h2>
        {Object.entries(serviciosPorCategoria).map(([categoria, lista]) => (
          <div key={categoria} style={{ marginBottom: "20px" }}>
            <h3>{categoria}</h3>
            <ul>
              {lista.map((s) => (
                <li
                  key={s.id_serv}
                  onClick={() => {
                    setSelectedService(s);
                    setStep(2);
                  }}
                  style={{
                    cursor: "pointer",
                    marginBottom: "10px",
                    border:
                      selectedService?.id_serv === s.id_serv
                        ? "2px solid #4CAF50"
                        : "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  {s.nombre_serv} — ${s.precio_serv}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );

  // --- Paso 2: Elegir profesional compatible ---
  if (step === 2) {
    const rolRequerido = selectedService?.rol_requerido;

    // Filtrar profesionales según rol y permitir "multi"
    const profesionalesFiltrados = profesionales.filter(
      (p) =>
        p.profesion === rolRequerido ||
        p.profesion === "multi"
    );

    return (
      <div className="turno-step">
        <h2>Elegí un profesional</h2>
        {profesionalesFiltrados.length > 0 ? (
          <ul>
            {profesionalesFiltrados.map((p) => (
              <li
                key={p.id}
                onClick={() => {
                  setSelectedProfessional(p);
                  setStep(3);
                }}
                style={{
                  cursor: "pointer",
                  marginBottom: "10px",
                  border:
                    selectedProfessional?.id === p.id
                      ? "2px solid #4CAF50"
                      : "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                {p.nombre} ({p.profesion})
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "gray" }}>
            No hay profesionales disponibles para este tipo de servicio.
          </p>
        )}
        <button onClick={() => setStep(1)}>Volver</button>
      </div>
    );
  }

  // --- Paso 3: Fecha ---
  if (step === 3)
    return (
      <div className="turno-step">
        <h2>Elegí la fecha</h2>
        <input
          type="date"
          value={selectedDate || ""}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <div style={{ marginTop: "15px" }}>
          <button onClick={() => setStep(2)}>Volver</button>
          <button
            disabled={!selectedDate}
            onClick={() => setStep(4)}
            style={{ marginLeft: "10px" }}
          >
            Siguiente
          </button>
        </div>
      </div>
    );

  // --- Paso 4: Hora ---
  if (step === 4)
    return (
      <div className="turno-step">
        <h2>Elegí la hora</h2>
        <input
          type="time"
          value={selectedTime || ""}
          onChange={(e) => setSelectedTime(e.target.value)}
        />
        <div style={{ marginTop: "15px" }}>
          <button onClick={() => setStep(3)}>Volver</button>
          <button
            disabled={!selectedTime}
            onClick={() => setStep(5)}
            style={{ marginLeft: "10px" }}
          >
            Siguiente
          </button>
        </div>
      </div>
    );

  // --- Paso 5: Confirmar ---
  if (step === 5)
    return (
      <TurnoResumen
        resumen={{
          servicioName: selectedService?.nombre_serv,
          profName: selectedProfessional?.nombre,
          fecha: selectedDate,
          hora: selectedTime,
          precio: selectedService?.precio_serv,
          duracion: selectedService?.duracion_serv,
        }}
        onBack={() => setStep(4)}
        onConfirm={onConfirm}
        saving={saving}
      />
    );

  return null;
}
