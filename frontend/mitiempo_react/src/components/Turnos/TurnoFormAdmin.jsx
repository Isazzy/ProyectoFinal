// front/src/components/Turnos/TurnoFormAdmin.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../Common/Modal";
import { getServicios } from "../../api/servicios";
<<<<<<< HEAD
import { getTurnoById, createTurno, updateTurno } from "../../api/turnos"; 
import api from "../../api/axiosConfig"; 

// 💡 1. Importamos el nuevo CSS
import "../../CSS/TurnoFormAdmin.css";

const initialState = {
  cliente: "", 
  fecha_turno: "", 
  hora_turno: "", 
  observaciones: "",
  servicios_ids: [], 
};

// --- Lógica de funciones (sin cambios) ---
const getFechaFromISO = (iso) => iso.split("T")[0];

const getHoraFromISO = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export default function TurnoFormAdmin({ onClose, turnoIdToEdit = null }) {
  const [turnoData, setTurnoData] = useState(initialState);
  const [serviciosList, setServiciosList] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isEditing = !!turnoIdToEdit;

  // --- Lógica de useEffect y handlers (sin cambios) ---
=======
import { getTurnoById, createTurno, updateTurno } from "../../api/turnos";
import api from "../../api/axiosConfig";
import "../../CSS/TurnoFormAdmin.css";

const initialState = {
  cliente: "",
  fecha_turno: "",
  hora_turno: "",
  observaciones: "",
  servicios_ids: [],
};

const getFechaFromISO = (iso) => iso.split("T")[0];
const getHoraFromISO = (iso) => {
  const dt = new Date(iso);
  return dt.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function TurnoFormAdmin({
  onClose,
  turnoIdToEdit = null,
  preselectedDateTime = null,
}) {
  const [turnoData, setTurnoData] = useState(initialState);
  const [serviciosList, setServiciosList] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEditing = !!turnoIdToEdit;

  // 🔹 Cargar servicios y usuarios (solo clientes)
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [servRes, cliRes] = await Promise.all([
          getServicios(),
<<<<<<< HEAD
          api.get("/usuarios/"), 
        ]);
        
        setServiciosList(servRes.data.filter(s => s.activado));
        setClientesList(cliRes.data.filter(u => u.role === 'cliente'));

=======
          api.get("/usuarios/"),
        ]);

        setServiciosList(servRes.data.filter((s) => s.activado));

        // ✅ Filtrar usuarios que pertenecen al grupo "cliente"
        const clientesFiltrados = cliRes.data.filter((u) =>
          u.groups?.some(
            (g) =>
              typeof g === "string"
                ? g.toLowerCase() === "cliente"
                : g.name?.toLowerCase() === "cliente"
          )
        );

        setClientesList(clientesFiltrados);
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
      } catch (err) {
        setError("No se pudieron cargar los datos necesarios.");
      } finally {
        if (!isEditing) {
          setLoading(false);
        }
      }
    };
    loadDropdownData();
  }, [isEditing]);

<<<<<<< HEAD
  
=======
  // 🔹 Si es edición, cargar turno actual
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  useEffect(() => {
    if (isEditing && clientesList.length > 0) {
      const loadTurno = async () => {
        try {
<<<<<<< HEAD
          const res = await getTurnoById(turnoIdToEdit); 
          const data = res.data; 

          const fecha = getFechaFromISO(data.fecha_hora_inicio);
          const hora = getHoraFromISO(data.fecha_hora_inicio);

          const idsServiciosActuales = data.servicios_asignados.map(s => s.servicio.id_serv);

          setTurnoData({
            cliente: String(data.cliente), 
            fecha_turno: fecha,
            hora_turno: hora,
            observaciones: data.observaciones || "",
            servicios_ids: idsServiciosActuales,
          });
=======
          const res = await getTurnoById(turnoIdToEdit);
          const data = res.data;
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be

          const fecha = getFechaFromISO(data.fecha_hora_inicio);
          const hora = getHoraFromISO(data.fecha_hora_inicio);
          const idsServiciosActuales = data.servicios_asignados.map(
            (s) => s.servicio.id_serv
          );

          setTurnoData({
            cliente: String(data.cliente),
            fecha_turno: fecha,
            hora_turno: hora,
            observaciones: data.observaciones || "",
            servicios_ids: idsServiciosActuales,
          });
        } catch (err) {
          setError("Error al cargar los datos del turno.");
        } finally {
          setLoading(false);
        }
      };
      loadTurno();
    }
  }, [isEditing, turnoIdToEdit, clientesList]);

<<<<<<< HEAD

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTurnoData(prev => ({ ...prev, [name]: value }));
=======
  // 🔹 Si no es edición, completar con fecha/hora del calendario
  useEffect(() => {
    if (!isEditing && preselectedDateTime) {
      const fecha = preselectedDateTime.toISOString().slice(0, 10);
      const hora = preselectedDateTime.toTimeString().slice(0, 5);
      setTurnoData((prev) => ({
        ...prev,
        fecha_turno: fecha,
        hora_turno: hora,
      }));
      setLoading(false);
    }
  }, [isEditing, preselectedDateTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTurnoData((prev) => ({ ...prev, [name]: value }));
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  };

  const handleServicioChange = (e) => {
    const { value, checked } = e.target;
    const servicioId = parseInt(value);
<<<<<<< HEAD
    setTurnoData(prev => {
      let currentServicios = [...prev.servicios_ids];
      if (checked) {
        currentServicios.push(servicioId);
      } else {
        currentServicios = currentServicios.filter(id => id !== servicioId);
      }
=======
    setTurnoData((prev) => {
      let currentServicios = [...prev.servicios_ids];
      if (checked) currentServicios.push(servicioId);
      else currentServicios = currentServicios.filter((id) => id !== servicioId);
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
      return { ...prev, servicios_ids: currentServicios.sort((a, b) => a - b) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setError(null); 

    if (!turnoData.cliente || !turnoData.fecha_turno || !turnoData.hora_turno || turnoData.servicios_ids.length === 0) {
=======
    setError(null);

    if (
      !turnoData.cliente ||
      !turnoData.fecha_turno ||
      !turnoData.hora_turno ||
      turnoData.servicios_ids.length === 0
    ) {
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
      setError("Cliente, Servicios, Fecha y Hora son obligatorios.");
      return;
    }

    setLoading(true);
<<<<<<< HEAD

=======
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    const localDateTimeString = `${turnoData.fecha_turno}T${turnoData.hora_turno}:00`;
    const fechaHoraInicio = new Date(localDateTimeString).toISOString();

    const payload = {
<<<<<<< HEAD
      cliente: parseInt(turnoData.cliente), 
      fecha_hora_inicio: fechaHoraInicio, 
      observaciones: turnoData.observaciones,
      servicios_ids: turnoData.servicios_ids, 
=======
      cliente: parseInt(turnoData.cliente),
      fecha_hora_inicio: fechaHoraInicio,
      observaciones: turnoData.observaciones,
      servicios_ids: turnoData.servicios_ids,
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    };

    try {
      if (isEditing) {
        await updateTurno(turnoIdToEdit, payload);
        toast.success("Turno actualizado");
      } else {
        await createTurno(payload);
        toast.success("Turno creado");
      }
<<<<<<< HEAD
      onClose(true); 

    } catch (err) {
      const apiError = err.response?.data;
      if (apiError?.fecha_hora_inicio) setError(`Horario: ${apiError.fecha_hora_inicio[0]}`);
      else if (apiError?.cliente) setError(`Cliente: ${apiError.cliente[0]}`);
      else if (apiError?.servicios_ids) setError(`Servicios: ${apiError.servicios_ids[0]}`);
      else if (apiError?.detail) setError(`Error: ${apiError.detail}`);
      else setError("Error de validación. Revisa los campos.");
      toast.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  
=======
      onClose(true);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError?.fecha_hora_inicio)
        setError(`Horario: ${apiError.fecha_hora_inicio[0]}`);
      else if (apiError?.cliente) setError(`Cliente: ${apiError.cliente[0]}`);
      else if (apiError?.servicios_ids)
        setError(`Servicios: ${apiError.servicios_ids[0]}`);
      else if (apiError?.detail) setError(`Error: ${apiError.detail}`);
      else setError("Error de validación. Revisa los campos.");
      toast.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      title={isEditing ? "Editar Turno" : "Agregar Nuevo Turno"}
      footer={
        <>
<<<<<<< HEAD
          {/* 💡 Estos botones ya usan las clases correctas del sistema de diseño */}
          <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="turno-form-admin" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear Turno")}
=======
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onClose(false)}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="turno-form-admin"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Turno"}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
          </button>
        </>
      }
    >
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
<<<<<<< HEAD
        
        // 💡 2. Usamos una clase simple para el formulario
        <form id="turno-form-admin" onSubmit={handleSubmit} className="turno-form-admin">
          
          {/* 💡 3. Se usa la nueva clase de alerta del sistema de diseño */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* 💡 4. Los 'form-group', 'form-select', 'form-input' y 'form-textarea' 
               ya tienen los estilos correctos de 'App.css'
          */}
          <div className="form-group">
            <label htmlFor="cliente">Cliente:</label>
            <select id="cliente" name="cliente" value={turnoData.cliente} onChange={handleChange} required className="form-select">
              <option value="" disabled>Seleccionar Cliente...</option>
              {clientesList.map(cli => (
=======
        <form
          id="turno-form-admin"
          onSubmit={handleSubmit}
          className="turno-form-admin"
        >
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="cliente">Cliente:</label>
            <select
              id="cliente"
              name="cliente"
              value={turnoData.cliente}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="" disabled>
                Seleccionar Cliente...
              </option>
              {clientesList.map((cli) => (
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
                <option key={cli.id} value={cli.id}>
                  {cli.first_name} {cli.last_name} ({cli.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="fecha_turno">Fecha:</label>
<<<<<<< HEAD
              <input id="fecha_turno" type="date" name="fecha_turno" value={turnoData.fecha_turno} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="hora_turno">Hora (HH:mm):</label>
              <input id="hora_turno" type="time" name="hora_turno" value={turnoData.hora_turno} onChange={handleChange} required className="form-input" />
=======
              <input
                id="fecha_turno"
                type="date"
                name="fecha_turno"
                value={turnoData.fecha_turno}
                onChange={handleChange}
                required
                className="form-input"
                min={getTodayDate()}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hora_turno">Hora (HH:mm):</label>
              <input
                id="hora_turno"
                type="time"
                name="hora_turno"
                value={turnoData.hora_turno}
                onChange={handleChange}
                required
                className="form-input"
                min={
                  turnoData.fecha_turno === getTodayDate()
                    ? getCurrentTime()
                    : undefined
                }
              />
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
            </div>
          </div>

          <div className="form-group">
            <label>Servicios:</label>
            <div className="checkbox-group-scroll">
<<<<<<< HEAD
              {serviciosList.map(s => (
                <label key={s.id_serv} className="checkbox-label">
                  <input 
=======
              {serviciosList.map((s) => (
                <label key={s.id_serv} className="checkbox-label">
                  <input
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
                    type="checkbox"
                    value={s.id_serv}
                    checked={turnoData.servicios_ids.includes(s.id_serv)}
                    onChange={handleServicioChange}
                  />
                  {s.nombre_serv} ({s.duracion_minutos} min)
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones (Opcional):</label>
<<<<<<< HEAD
            <textarea 
              id="observaciones" name="observaciones"
              value={turnoData.observaciones} onChange={handleChange}
              rows="3" className="form-textarea"
=======
            <textarea
              id="observaciones"
              name="observaciones"
              value={turnoData.observaciones}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
              placeholder="Anotaciones internas..."
            />
          </div>
        </form>
      )}
<<<<<<< HEAD
      
      {/* 💡 5. El bloque <style> se ha eliminado */}
      
    </Modal>
  );
}
=======
    </Modal>
  );
}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
