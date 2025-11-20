// src/components/Turnos/TurnoFormAdmin.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal from "../Common/Modal"; // 💡 1. Usa el Modal genérico
import { getServicios } from "../../api/servicios";
import { getTurnos, createTurno, updateTurno } from "../../api/turnos"; // 💡 2. API de Turnos
import api from "../../api/axiosConfig"; // Para la API de usuarios

const initialState = {
  id_cli: "",
  id_prof: "",
  fecha_turno: "",
  hora_turno: "", // Guardará HH:mm
  observaciones: "",
  id_servicios: [], // Array de IDs
};

export default function TurnoFormAdmin({ onClose, turnoIdToEdit = null }) {
  const [turnoData, setTurnoData] = useState(initialState);
  const [serviciosList, setServiciosList] = useState([]);
  const [profesionalesList, setProfesionalesList] = useState([]);
  const [clientesList, setClientesList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isEditing = !!turnoIdToEdit;

  // --- Carga de datos (tu lógica era excelente) ---
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [servRes, profRes, cliRes] = await Promise.all([
          getServicios(),
          api.get("/usuarios/empleados/"),
          api.get("/usuarios/"), // Obtiene todos, filtraremos
        ]);
        
        setServiciosList(servRes.data.filter(s => s.activado));
        setProfesionalesList(profRes.data);
        setClientesList(cliRes.data.filter(u => u.role === 'cliente'));

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

  // --- Carga del Turno Específico (si se edita) ---
  useEffect(() => {
    if (isEditing && profesionalesList.length > 0 && clientesList.length > 0) {
      const loadTurno = async () => {
        try {
          const res = await getTurnos(turnoIdToEdit); // Asumo que getTurnos(id) funciona
          const data = res.data;

          const horaFormateada = data.hora_turno.substring(0, 5);
          const idsServiciosActuales = data.servicios.map(s => s.servicio.id_serv);

          setTurnoData({
            id_cli: String(data.id_cli), 
            id_prof: String(data.id_prof),
            fecha_turno: data.fecha_turno,
            hora_turno: horaFormateada,
            observaciones: data.observaciones || "",
            id_servicios: idsServiciosActuales,
          });

        } catch (err) {
          setError("Error al cargar los datos del turno.");
        } finally {
          setLoading(false);
        }
      };
      loadTurno();
    }
  }, [isEditing, turnoIdToEdit, profesionalesList, clientesList]);

  // --- Handlers (tu lógica era perfecta) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTurnoData(prev => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (e) => {
    const { value, checked } = e.target;
    const servicioId = parseInt(value);
    setTurnoData(prev => {
      let currentServicios = [...prev.id_servicios];
      if (checked) {
        currentServicios.push(servicioId);
      } else {
        currentServicios = currentServicios.filter(id => id !== servicioId);
      }
      return { ...prev, id_servicios: currentServicios.sort((a, b) => a - b) };
    });
  };

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    if (!turnoData.id_cli || !turnoData.id_prof || !turnoData.fecha_turno || !turnoData.hora_turno || turnoData.id_servicios.length === 0) {
      setError("Cliente, Profesional, Servicios, Fecha y Hora son obligatorios.");
      return;
    }

    setLoading(true);
    const payload = {
      ...turnoData,
      id_cli: parseInt(turnoData.id_cli),
      id_prof: parseInt(turnoData.id_prof),
    };

    try {
      if (isEditing) {
        await updateTurno(turnoIdToEdit, payload);
        toast.success("Turno actualizado");
      } else {
        await createTurno(payload);
        toast.success("Turno creado");
      }
      onClose(true); // Cierra modal y refresca agenda

    } catch (err) {
      const apiError = err.response?.data;
      if (apiError?.hora_turno) setError(`Horario: ${apiError.hora_turno[0]}`);
      else if (apiError?.detail) setError(`Error: ${apiError.detail}`);
      else setError("Error de validación. Revisa los campos.");
      toast.error("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado del Modal ---
  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      title={isEditing ? "Editar Turno" : "Agregar Nuevo Turno"}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" form="turno-form-admin" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear Turno")}
          </button>
        </>
      }
    >
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        // 💡 3. Formulario con clases globales
        <form id="turno-form-admin" onSubmit={handleSubmit} className="form-container-modal">
          
          {error && <p className="message error">{error}</p>}

          <div className="form-group">
            <label htmlFor="id_cli">Cliente:</label>
            <select id="id_cli" name="id_cli" value={turnoData.id_cli} onChange={handleChange} required className="form-select">
              <option value="" disabled>Seleccionar Cliente...</option>
              {clientesList.map(cli => (
                <option key={cli.id} value={cli.id}>
                  {cli.first_name} {cli.last_name} ({cli.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="id_prof">Profesional:</label>
            <select id="id_prof" name="id_prof" value={turnoData.id_prof} onChange={handleChange} required className="form-select">
              <option value="" disabled>Seleccionar Profesional...</option>
              {profesionalesList.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.first_name} {prof.last_name} ({prof.rol_profesional})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="fecha_turno">Fecha:</label>
              <input id="fecha_turno" type="date" name="fecha_turno" value={turnoData.fecha_turno} onChange={handleChange} required className="form-input" />
            </div>
            <div className="form-group">
              <label htmlFor="hora_turno">Hora (HH:mm):</label>
              <input id="hora_turno" type="time" name="hora_turno" value={turnoData.hora_turno} onChange={handleChange} required className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label>Servicios:</label>
            <div className="checkbox-group-scroll">
              {serviciosList.map(s => (
                <label key={s.id_serv} className="checkbox-label">
                  <input 
                    type="checkbox"
                    value={s.id_serv}
                    checked={turnoData.id_servicios.includes(s.id_serv)}
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
              id="observaciones" name="observaciones"
              value={turnoData.observaciones} onChange={handleChange}
              rows="3" className="form-textarea"
              placeholder="Anotaciones internas..."
            />
          </div>
        </form>
      )}
      
      {/* 💡 4. CSS local para el formulario */}
      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .checkbox-group-scroll {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          padding: 15px;
          border-radius: var(--border-radius);
          max-height: 150px;
          overflow-y: auto;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-color-muted);
        }
        .checkbox-label input {
           width: 16px; height: 16px;
           accent-color: var(--primary-color);
        }
        @media (max-width: 600px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .checkbox-group-scroll { grid-template-columns: 1fr; }
        }
      `}</style>
    </Modal>
  );
}