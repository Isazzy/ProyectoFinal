// src/pages/Reservar.jsx
import React, { useState } from "react";
import ServiciosList from "../components/ServiciosList";
import CrearTurno from "../components/Turnos/CrearTurno";

const Reservar = () => {
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  return (
    <div>
      <h1>Reservar turno</h1>

      {!servicioSeleccionado ? (
        <>
          <p>Seleccioná un servicio para continuar:</p>
          <ServiciosList onSelect={setServicioSeleccionado} />
        </>
      ) : (
        <div>
          <h2>Servicio seleccionado</h2>
          <p>
            <strong>{servicioSeleccionado.nombre_serv}</strong> - $
            {servicioSeleccionado.precio_serv}
          </p>

          {/* ✅ Mostrar el formulario con el servicio seleccionado */}
          <CrearTurno servicioPreseleccionado={servicioSeleccionado} />

          <button style={{ marginTop: 20 }} onClick={() => setServicioSeleccionado(null)}>
            Cambiar servicio
          </button>
        </div>
      )}
    </div>
  );
};

export default Reservar;
