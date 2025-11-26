// src/components/Booking/BookingPage.jsx
import React, { useState } from "react";
import { useBooking } from "../../hooks/useBooking";
import SeleccionHora from "./SeleccionHora";
import "./BookingPage.css";
import { turnosApi } from "../../api/turnosApi";
import { useSwal } from "../../hooks/useSwal";

export default function BookingPage() {
  const {
    step,
    servicios,
    bookingData,
    horariosDisponibles,
    dateError,
    loading,
    selectServicio,
    selectFecha,
    selectHora,
    confirmarReserva,
    backStep,
  } = useBooking();

  const { showSuccess, showError } = useSwal();

  // Estado para el modal
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [archivo, setArchivo] = useState(null);

  // =======================
  // SUBIR COMPROBANTE
  // =======================
  const subirComprobante = async () => {
    if (!archivo) {
      showError("Error", "Subí un archivo primero.");
      return;
    }

    if (!bookingData.idTurno) {
      showError("Error", "No se pudo detectar el turno.");
      return;
    }

    try {
      await turnosApi.subirComprobante(
        bookingData.idTurno,
        archivo,
        "seña"
      );

      await showSuccess("Listo", "Comprobante subido con éxito.");
      setShowPagoModal(false);

    } catch (err) {
      console.error(err);
      showError("Error", "No se pudo subir el comprobante.");
    }
  };

  return (
    <div className="booking-container">

      {/* ======================= */}
      {/* PASO 0 - SELECCIÓN SERVICIO */}
      {/* ======================= */}
      {step === 0 && (
        <div>
          <h2>Seleccioná un servicio</h2>

          <h3>Peluquería</h3>
          {servicios
            .filter(s => s.tipo_serv === "peluqueria")
            .map(serv => (
              <div
                key={serv.id_serv}
                className="servicio-card"
                onClick={() => selectServicio(serv)}
              >
                {serv.nombre} – ${serv.precio}
              </div>
            ))}

          <h3>Maquillaje</h3>
          {servicios
            .filter(s => s.tipo_serv === "maquilladora")
            .map(serv => (
              <div
                key={serv.id_serv}
                className="servicio-card"
                onClick={() => selectServicio(serv)}
              >
                {serv.nombre} – ${serv.precio}
              </div>
            ))}

          <h3>Uñas / Manicura</h3>
          {servicios
            .filter(s => s.tipo_serv === "manicura")
            .map(serv => (
              <div
                key={serv.id_serv}
                className="servicio-card"
                onClick={() => selectServicio(serv)}
              >
                {serv.nombre} – ${serv.precio}
              </div>
            ))}
        </div>
      )}

      {/* ======================= */}
      {/* PASO 1 - SELECCIÓN FECHA */}
      {/* ======================= */}
      {step === 1 && (
        <div>
          <h2>Seleccioná una fecha para {bookingData.servicio?.nombre}</h2>

          <input
            type="date"
            value={bookingData.fecha}
            onChange={selectFecha}
            className="input-date"
          />

          {dateError && <p className="error-msg">{dateError}</p>}

          <button className="btn-volver" onClick={backStep}>
            Volver
          </button>
        </div>
      )}

      {/* ======================= */}
      {/* PASO 2 - SELECCIÓN HORA */}
      {/* ======================= */}
      {step === 2 && (
        <div>
          <h2>Seleccioná un horario</h2>

          <SeleccionHora
            horariosDisponibles={horariosDisponibles}
            horarioActual={bookingData.hora}
            onSelect={selectHora}
          />

          <button className="btn-volver" onClick={backStep}>
            Volver
          </button>

          {/* 🔥 BOTÓN – Pagar / subir comprobante */}
          {bookingData.servicio && bookingData.fecha && bookingData.hora && (
            <button
              className="btn-confirmar"
              style={{ background: "#8d44ad", marginLeft: 10 }}
              onClick={() => setShowPagoModal(true)}
            >
              Pagar / Subir comprobante
            </button>
          )}

          <button className="btn-confirmar" onClick={confirmarReserva}>
            Confirmar reserva
          </button>
        </div>
      )}

      {loading && <p>Cargando...</p>}

      {/* ======================= */}
      {/* MODAL DE PAGO */}
      {/* ======================= */}
      {showPagoModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Datos de pago</h2>

            <p><b>Alias:</b> salon.romi.boutique</p>
            <p><b>CBU:</b> 0000003100045539852040</p>
            <p><b>Titular:</b> Romina (salón Boutique)</p>

            <hr />

            <label><b>Subir comprobante:</b></label>
            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files[0])}
            />

            <div style={{ marginTop: 15 }}>
              <button
                className="btn-confirmar"
                onClick={subirComprobante}
                style={{ marginRight: 10 }}
              >
                Enviar comprobante
              </button>

              <button
                className="btn-volver"
                onClick={() => setShowPagoModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
