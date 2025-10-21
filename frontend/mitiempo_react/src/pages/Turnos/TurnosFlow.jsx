// front/src/pages/Turnos/TurnosFlow.jsx
import React, { useState, useEffect } from "react";
import turnosApi from "../../api/turnos";
import usuariosApi from "../../api/Usuarios";
import * as serviciosApi from "../../api/servicios"; // usa named imports
import TurnoResumen from "../../components/Turnos/TurnoResumen";

export default function TurnosFlow() {
  const [step, setStep] = useState(1);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  // Cargar servicios y profesionales
  useEffect(() => {
    serviciosApi
      .getServicios()
      .then((res) => setServicios(res.data))
      .catch((err) => console.error(err));

    usuariosApi
      .getUsuarios()
      .then((res) => {
        const empleados = res.data.filter(
          (u) => u.role === "empleado" || u.role === "admin"
        );
        setProfesionales(empleados);
      })
      .catch((err) => console.error(err));
  }, []);

  const onConfirm = async () => {
    setSaving(true);
    try {
      const turnoData = {
        id_serv: selectedService,
        id_prof: selectedProfessional,
        fecha_turno: selectedDate,
        hora_turno: selectedTime,
        estado_turno: "pendiente",
      };

      await turnosApi.createTurno(turnoData);
      alert("Turno creado correctamente");

      setStep(1);
      setSelectedService(null);
      setSelectedProfessional(null);
      setSelectedDate(null);
      setSelectedTime(null);
    } catch (error) {
      console.error(error);
      alert("Error al crear el turno");
    } finally {
      setSaving(false);
    }
  };

  // Paso 1 — Servicio
  if (step === 1)
    return (
      <div className="turno-step">
        <h2>Elegí un servicio</h2>
        <ul>
          {servicios.map((s) => (
            <li
              key={s.id_serv}
              onClick={() => {
                setSelectedService(s.id_serv);
                setStep(2);
              }}
              style={{
                cursor: "pointer",
                marginBottom: "10px",
                border:
                  selectedService === s.id_serv
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
    );

  // Paso 2 — Profesional
  if (step === 2)
    return (
      <div className="turno-step">
        <h2>Elegí un profesional</h2>
        <ul>
          {profesionales.map((p) => (
            <li
              key={p.id}
              onClick={() => {
                setSelectedProfessional(p.id);
                setStep(3);
              }}
              style={{
                cursor: "pointer",
                marginBottom: "10px",
                border:
                  selectedProfessional === p.id
                    ? "2px solid #4CAF50"
                    : "1px solid #ccc",
                padding: "10px",
                borderRadius: "6px",
              }}
            >
              {p.first_name} {p.last_name}
            </li>
          ))}
        </ul>
        <button onClick={() => setStep(1)}>Volver</button>
      </div>
    );

  // Paso 3 — Fecha
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

  // Paso 4 — Hora
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

  // Paso 5 — Confirmar
  if (step === 5) {
    const servicio = servicios.find((s) => s.id_serv === selectedService);
    const profesional = profesionales.find(
      (p) => p.id === selectedProfessional
    );

    return (
      <TurnoResumen
        resumen={{
          servicioName: servicio?.nombre_serv,
          profName: profesional
            ? `${profesional.first_name} ${profesional.last_name}`
            : "",
          fecha: selectedDate,
          hora: selectedTime,
          precio: servicio?.precio_serv,
          duracion: servicio?.duracion_serv,
        }}
        onBack={() => setStep(4)}
        onConfirm={onConfirm}
        saving={saving}
      />
    );
  }

  return null;
}
