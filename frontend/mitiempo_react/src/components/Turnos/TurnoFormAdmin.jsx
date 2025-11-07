// front/src/components/Turnos/TurnoFormAdmin.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../Common/Modal";
import { getServicios } from "../../api/servicios";
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
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [servRes, cliRes] = await Promise.all([
          getServicios(),
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

  // 🔹 Si es edición, cargar turno actual
  useEffect(() => {
    if (isEditing && clientesList.length > 0) {
      const loadTurno = async () => {
        try {
          const res = await getTurnoById(turnoIdToEdit);
          const data = res.data;

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
  };

  const handleServicioChange = (e) => {
    const { value, checked } = e.target;
    const servicioId = parseInt(value);
    setTurnoData((prev) => {
      let currentServicios = [...prev.servicios_ids];
      if (checked) currentServicios.push(servicioId);
      else currentServicios = currentServicios.filter((id) => id !== servicioId);
      return { ...prev, servicios_ids: currentServicios.sort((a, b) => a - b) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !turnoData.cliente ||
      !turnoData.fecha_turno ||
      !turnoData.hora_turno ||
      turnoData.servicios_ids.length === 0
    ) {
      setError("Cliente, Servicios, Fecha y Hora son obligatorios.");
      return;
    }

    setLoading(true);
    const localDateTimeString = `${turnoData.fecha_turno}T${turnoData.hora_turno}:00`;
    const fechaHoraInicio = new Date(localDateTimeString).toISOString();

    const payload = {
      cliente: parseInt(turnoData.cliente),
      fecha_hora_inicio: fechaHoraInicio,
      observaciones: turnoData.observaciones,
      servicios_ids: turnoData.servicios_ids,
    };

    try {
      if (isEditing) {
        await updateTurno(turnoIdToEdit, payload);
        toast.success("Turno actualizado");
      } else {
        await createTurno(payload);
        toast.success("Turno creado");
      }
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

  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      title={isEditing ? "Editar Turno" : "Agregar Nuevo Turno"}
      footer={
        <>
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
          </button>
        </>
      }
    >
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
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
                <option key={cli.id} value={cli.id}>
                  {cli.first_name} {cli.last_name} ({cli.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="fecha_turno">Fecha:</label>
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
            </div>
          </div>

          <div className="form-group">
            <label>Servicios:</label>
            <div className="checkbox-group-scroll">
              {serviciosList.map((s) => (
                <label key={s.id_serv} className="checkbox-label">
                  <input
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
            <textarea
              id="observaciones"
              name="observaciones"
              value={turnoData.observaciones}
              onChange={handleChange}
              rows="3"
              className="form-textarea"
              placeholder="Anotaciones internas..."
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
