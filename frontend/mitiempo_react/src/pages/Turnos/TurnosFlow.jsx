// front/src/pages/Turnos/TurnosFlow.jsx
import React, { useEffect, useState } from "react";
import { fetchServicios, fetchUsuarios, fetchTurnos, createTurno } from "../../api/index";


function Step1_Service({ servicios, onNext, selectedService, setSelectedService }) {
  return (
    <div>
      <h3>Paso 1 — Seleccioná un servicio</h3>
      <ul>
        {servicios.map((s) => (
          <li key={s.id_serv}>
            <label>
              <input
                type="radio"
                name="servicio"
                checked={selectedService === s.id_serv}
                onChange={() => setSelectedService(s.id_serv)}
              />
              {s.nombre_serv} — ${s.precio_serv}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={!selectedService} onClick={onNext}>Siguiente</button>
    </div>
  );
}

function Step2_Professional({ profesionales, onNext, onBack, selectedProf, setSelectedProf }) {
  return (
    <div>
      <h3>Paso 2 — Elegí profesional</h3>
      <ul>
        {profesionales.map((p) => (
          <li key={p.id}>
            <label>
              <input type="radio" name="prof" checked={selectedProf === p.id} onChange={() => setSelectedProf(p.id)} />
              {p.username} ({p.first_name} {p.last_name})
            </label>
          </li>
        ))}
      </ul>
      <button onClick={onBack}>Volver</button>
      <button disabled={!selectedProf} onClick={onNext}>Siguiente</button>
    </div>
  );
}

function Step3_Date({ onNext, onBack, selectedDate, setSelectedDate, minDate }) {
  return (
    <div>
      <h3>Paso 3 — Seleccioná fecha</h3>
      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={minDate} />
      <div style={{ marginTop: 12 }}>
        <button onClick={onBack}>Volver</button>
        <button disabled={!selectedDate} onClick={onNext}>Siguiente</button>
      </div>
    </div>
  );
}

function Step4_Time({ availableTimes, onNext, onBack, selectedTime, setSelectedTime }) {
  return (
    <div>
      <h3>Paso 4 — Horario</h3>
      {availableTimes.length === 0 ? (
        <p>No hay horarios disponibles para esa fecha.</p>
      ) : (
        <ul>
          {availableTimes.map((t) => (
            <li key={t}>
              <label>
                <input type="radio" checked={selectedTime === t} onChange={() => setSelectedTime(t)} />
                {t}
              </label>
            </li>
          ))}
        </ul>
      )}
      <button onClick={onBack}>Volver</button>
      <button disabled={!selectedTime} onClick={onNext}>Siguiente</button>
    </div>
  );
}

function Step5_Confirm({ onBack, onConfirm, summary, saving }) {
  return (
    <div>
      <h3>Paso 5 — Confirmación</h3>
      <div>
        <p><b>Servicio:</b> {summary.servicioName}</p>
        <p><b>Profesional:</b> {summary.profName}</p>
        <p><b>Fecha:</b> {summary.fecha}</p>
        <p><b>Hora:</b> {summary.hora}</p>
      </div>
      <button onClick={onBack}>Volver</button>
      <button onClick={onConfirm} disabled={saving}>{saving ? "Guardando..." : "Confirmar turno"}</button>
    </div>
  );
}

// Main flow
export default function TurnosFlow() {
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [step, setStep] = useState(1);

  // selections
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProf, setSelectedProf] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchServicios().then(setServicios).catch(console.error);
    // para profesionales traemos usuarios y filtramos role === 'empleado'
    fetchUsuarios()
      .then((users) => {
        const empleados = users.filter((u) => u.role === "empleado");
        setProfesionales(empleados);
      })
      .catch((e) => console.error(e));
    fetchTurnos().then(setTurnos).catch(() => setTurnos([]));
  }, []);

  // compute available times for selected date and professional
  const computeAvailableTimes = () => {
    // ejemplo simple: franjas cada 30 min entre 09:00 y 17:00
    const allSlots = [];
    for (let h = 9; h < 17; h++) {
      allSlots.push(`${String(h).padStart(2, "0")}:00`);
      allSlots.push(`${String(h).padStart(2, "0")}:30`);
    }
    // filtrar slots ya ocupados por turnos del mismo profesional en la misma fecha
    const occupied = turnos
      .filter((t) => String(t.id_cli) !== "null") // no necesario, solo filtros por profesional/fecha
      .filter((t) => {
        // t.id_cli is user id, t.id_turno etc — backend fields vary; adapt if necesario
        // asumimos t.id_turno, t.id_cli, t.fecha_turno, t.hora_turno, t.servicios (array)
        return t.id_servicio === selectedService && t.id_profesional === selectedProf && t.fecha_turno === selectedDate;
      })
      .map((t) => t.hora_turno);

    return allSlots.filter((s) => !occupied.includes(s));
  };

  // Helpers para nombres
  const servicioName = servicios.find((s) => s.id_serv === selectedService)?.nombre_serv || "-";
  const profName = profesionales.find((p) => p.id === selectedProf)?.username || "-";

  const availableTimes = computeAvailableTimes();

  const onConfirm = async () => {
    setSaving(true);
    setMessage("");
    try {
      // payload: adaptar campos a tu modelo Turnos:
      // Turnos model expects: id_cli, fecha_turno, hora_turno, estado_turno, observaciones
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      // You may need user id; if you don't store it in localStorage, backend may use request.user when creating — but since you call POST to /turnos/ it sends id_cli
      // Best approach: if backend uses request.user in perform_create, don't send id_cli. In your TurnosViewSet.perform_create you saved id_cli=self.request.user so you should NOT send id_cli.
      const payload = {
        // id_cli: <omit if backend uses request.user>,
        fecha_turno: selectedDate,
        hora_turno: selectedTime,
        estado_turno: "pendiente",
        observaciones: "",
      };

      await createTurno(payload);
      setMessage("Turno creado con éxito");
      // recargar turnos
      const updated = await fetchTurnos();
      setTurnos(updated);
      setStep(1);
      setSelectedService(null);
      setSelectedProf(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (err) {
      setMessage(err.message || "Error creando turno");
    } finally {
      setSaving(false);
    }
  };

  // Basic step navigation
  return (
    <div style={{ padding: 20 }}>
      <h2>Sacar Turno</h2>
      {message && <div style={{ marginBottom: 12 }}>{message}</div>}

      {step === 1 && (
        <Step1_Service
          servicios={servicios}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2_Professional
          profesionales={profesionales}
          selectedProf={selectedProf}
          setSelectedProf={setSelectedProf}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3_Date
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          minDate={new Date().toISOString().split("T")[0]}
        />
      )}

      {step === 4 && (
        <Step4_Time
          availableTimes={availableTimes}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <Step5_Confirm
          summary={{ servicioName, profName, fecha: selectedDate, hora: selectedTime }}
          onBack={() => setStep(4)}
          onConfirm={onConfirm}
          saving={saving}
        />
      )}
    </div>
  );
}
