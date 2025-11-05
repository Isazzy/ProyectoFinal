// front/src/components/Booking/BookingPage.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Estilo base del calendario

import { useAuth } from "../../Context/AuthContext";
import { getServicios } from "../../api/servicios";
import { getHorariosDisponibles, createTurno } from "../../api/turnos";

// 💡 1. Importamos el CSS rediseñado
import "../../CSS/BookingPage.css";

// --- Lógica de helpers (sin cambios) ---
const groupServicios = (servicios) => {
  return servicios.reduce((acc, srv) => {
    const tipo = srv.tipo_serv || "Varios";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(srv);
    return acc;
  }, {});
};
const formatDuration = (minutos) => {
  if (!minutos || minutos <= 0) return "";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h > 0) return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
  return `~${m} min`;
};
// ------------------------------------

export default function BookingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const [servicios, setServicios] = useState({});
  const [mergedSlots, setMergedSlots] = useState([]);

  const [selectedServicios, setSelectedServicios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [observaciones, setObservaciones] = useState("");

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");

  // --- Lógica de useEffect y Handlers (sin cambios) ---
  useEffect(() => {
    setLoading(true);
    getServicios()
      .then((res) => {
        const activos = res.data.filter((s) => s.activado);
        setServicios(groupServicios(activos));
      })
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedServicios.length === 0 || !selectedDate) {
      setMergedSlots([]);
      return;
    }
    setLoadingSlots(true);
    const fechaISO = selectedDate.toISOString().split("T")[0];
    getHorariosDisponibles(fechaISO, selectedServicios)
      .then((res) => {
         const slots = (res.data.disponibilidad || []).map(s => s.hora || s); 
         setMergedSlots(slots);
      })
      .catch(() => setMergedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedServicios, selectedDate]);

  const handleServiceToggle = (id) => {
    setSelectedServicios((prev) =>
      prev.includes(id) ? prev.filter((s_id) => s_id !== id) : [...prev, id]
    );
  };
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };
  const handleSlotClick = (slot) => setSelectedSlot(slot);

  const goToStep2 = () => {
    if (selectedServicios.length === 0) {
      setError("Debes seleccionar al menos un servicio.");
      return;
    }
    setError("");
    setStep(2);
  };

  const goToStep3 = () => {
    if (!selectedSlot) {
      setError("Debes seleccionar un horario.");
      return;
    }
    setError("");
    const allServicios = Object.values(servicios).flat();
    const serviciosSeleccionados = allServicios.filter((s) =>
      selectedServicios.includes(s.id_serv)
    );
    const totalPrecio = serviciosSeleccionados.reduce(
      (acc, s) => acc + parseFloat(s.precio_serv),
      0
    );
    const totalDuracion = serviciosSeleccionados.reduce(
      (acc, s) => acc + (s.duracion_minutos || 0),
      0
    );
    setResumen({
      nombres: serviciosSeleccionados.map((s) => s.nombre_serv).join(", "),
      fecha: selectedDate.toLocaleDateString("es-AR"),
      hora: selectedSlot,
      precio: totalPrecio,
      duracion: formatDuration(totalDuracion),
      observaciones,
    });
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError("");
    if (!user) {
      setError("Error: No se encontró al cliente. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }
    const fechaISO = selectedDate.toISOString().split("T")[0];
    const fechaHoraInicio = new Date(`${fechaISO}T${selectedSlot}:00`).toISOString();
    const turnoData = {
      fecha_hora_inicio: fechaHoraInicio,
      servicios_ids: selectedServicios,
      observaciones,
    };
    try {
      await createTurno(turnoData);
      toast.success("¡Turno reservado con éxito!");
      setStep(1);
      setSelectedServicios([]);
      setSelectedDate(new Date());
      setSelectedSlot(null);
      setObservaciones("");
      setResumen(null);
    } catch (err) {
      let errorMsg = "Error al crear el turno.";
      if (err.response && err.response.data) {
        const data = err.response.data;
        const firstErrorKey = Object.keys(data)[0];
        if (firstErrorKey) {
          errorMsg = Array.isArray(data[firstErrorKey])
            ? data[firstErrorKey][0]
            : data[firstErrorKey];
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  // ------------------------------------

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            {loading && <p>Cargando servicios...</p>}
            {Object.keys(servicios).map((tipo) => (
              <div key={tipo} className="categoria-grupo">
                <h3 className="categoria-titulo">{tipo}</h3>
                <div className="servicios-lista">
                  {servicios[tipo].map((s) => (
                    <div
                      key={s.id_serv}
                      className={`servicio-item ${
                        selectedServicios.includes(s.id_serv) ? "selected" : ""
                      }`}
                    >
                      <div className="servicio-info">
                        <span className="servicio-nombre">{s.nombre_serv}</span>
                        <span className="servicio-precio">${s.precio_serv}</span>
                        <span className="servicio-duracion">
                          {formatDuration(s.duracion_minutos)}
                        </span>
                      </div>
                      <button
                        // 💡 Clases globales de botón
                        className={`btn ${
                          selectedServicios.includes(s.id_serv)
                            ? "btn-primary"
                            : "btn-secondary"
                        }`}
                        onClick={() => handleServiceToggle(s.id_serv)}
                      >
                        {selectedServicios.includes(s.id_serv) ? "✓" : "Elegir"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="footer-accion">
              <button
                className="btn btn-primary"
                onClick={goToStep2}
                disabled={selectedServicios.length === 0}
              >
                Siguiente: Elegir Fecha y Hora
              </button>
            </div>
          </>
        );

      case 2:
        return (
          <div className="step-datetime-container">
            <div className="calendar-wrapper">
              <h4>1. Selecciona la Fecha</h4>
              <Calendar onChange={handleDateChange} value={selectedDate} minDate={new Date()} />
            </div>
            <div className="slots-wrapper">
              <h4>2. Selecciona el Horario</h4>
              {loadingSlots && <p>Buscando horarios...</p>}
              {!loadingSlots && mergedSlots.length === 0 && (
                <p>No hay horarios disponibles para esta fecha.</p>
              )}
              {mergedSlots.length > 0 && (
                <div className="slots-grid">
                  {mergedSlots.map((slot) => (
                    <button
                      key={slot}
                      // 💡 2. CORREGIDO: Usamos la clase .selected (de App.css)
                      // en lugar de .btn-primary / .btn-secondary
                      className={`btn slot-btn ${
                        selectedSlot === slot ? "selected" : ""
                      }`}
                      onClick={() => handleSlotClick(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="navigation-buttons">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                Volver
              </button>
              <button
                className="btn btn-primary"
                onClick={goToStep3}
                disabled={!selectedSlot}
              >
                Siguiente: Confirmar
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-confirm-container">
            <h3>Resumen de tu Turno</h3>
            {resumen && (
              <div className="resumen-detalle">
                <p>
                  <strong>Servicio(s):</strong> {resumen.nombres}
                </p>
                <p>
                  <strong>Fecha:</strong> {resumen.fecha}
                </p>
                <p>
                  <strong>Hora:</strong> {resumen.hora}
                </p>
                <p>
                  <strong>Duración Estimada:</strong> {resumen.duracion}
                </p>
                <p>
                  <strong>Precio Total:</strong> ${resumen.precio?.toFixed(2)}
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones (Opcional):</label>
              <textarea
                id="observaciones"
                name="observaciones"
                className="form-textarea" // Clase global
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Alergias, preferencias, etc."
                rows="3"
              />
            </div>

            <div className="navigation-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Volver
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? "Confirmando..." : "Confirmar Turno"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // 💡 Usa la clase global .app-container
    <div className="app-container"> 
      {/* 💡 Y la clase .card para el fondo blanco */}
      <div className="reserva-container card">
        <div className="step-title">
          <h2 className="header-title">Reserva tu Turno</h2>
          <div className="stepper-visual">
            <span className={step === 1 ? "active" : ""}></span>
            <span className={step === 2 ? "active" : ""}></span>
            <span className={step === 3 ? "active" : ""}></span>
          </div>
        </div>

        {/* 💡 3. CORREGIDO: Usa la clase de alerta global */}
        {error && <div className="alert alert-error">{error}</div>}

        {renderStep()}
      </div>
    </div>
  );
}