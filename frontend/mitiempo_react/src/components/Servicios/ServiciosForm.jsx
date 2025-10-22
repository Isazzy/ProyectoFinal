// src/components/Servicios/ServiciosForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createServicio,
  updateServicio,
  getServicioById,
} from "../../api/servicios";
import "../../CSS/serviciosForm.css";

export default function ServiciosForm() {
  const [servicio, setServicio] = useState({
    nombre_serv: "",
    tipo_serv: "",
    precio_serv: "",
    duracion_serv: "",
    descripcion_serv: "",
    disponible_serv: 1,
    activado: true,
    rol_requerido: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Opciones predefinidas (de la lógica de la BD)
  const tiposServicio = ["Peluquería", "Uñas", "Maquillaje"];
  const roles = ["Peluquera", "Manicurista", "Estilista", "Múltiple"];

  // Cargar servicio existente si hay ID
  useEffect(() => {
    const cargarServicio = async () => {
      if (id) {
        try {
          const res = await getServicioById(id);
          console.log("Servicio cargado:", res.data);
          setServicio(res.data);
        } catch (err) {
          console.error("Error al cargar servicio:", err);
          setError("Error al cargar el servicio.");
        }
      }
    };
    cargarServicio();
  }, [id]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServicio((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guardar cambios (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!servicio.nombre_serv || !servicio.tipo_serv || !servicio.precio_serv) {
      setError("Nombre, tipo y precio son obligatorios.");
      return;
    }

    const payload = {
      ...servicio,
      precio_serv: parseFloat(servicio.precio_serv),
    };

    try {
      if (id) {
        console.log("Actualizando servicio:", id, payload);
        await updateServicio(id, payload);
        console.log("Servicio actualizado correctamente");
      } else {
        console.log("Creando servicio:", payload);
        await createServicio(payload);
        console.log("Servicio creado correctamente");
      }

      navigate("/admin/dashboard/servicios");
    } catch (err) {
      console.error("Error al guardar servicio:", err);
      if (err.response?.data) {
        console.error("Detalles del error:", err.response.data);
      }
      setError("Error al guardar el servicio.");
    }
  };

  return (
    <div className="servicios-form-container">
      <h2>{id ? "Editar Servicio" : "Nuevo Servicio"}</h2>

      <form onSubmit={handleSubmit} className="servicios-form">
        {/* Nombre */}
        <label>Nombre del servicio</label>
        <input
          name="nombre_serv"
          value={servicio.nombre_serv}
          onChange={handleChange}
          placeholder="Ej: Corte de cabello"
          required
        />

        {/* Tipo */}
        <label>Tipo de servicio</label>
        <select
          name="tipo_serv"
          value={servicio.tipo_serv}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar tipo</option>
          {tiposServicio.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        {/* Rol requerido */}
        <label>Rol requerido</label>
        <select
          name="rol_requerido"
          value={servicio.rol_requerido || ""}
          onChange={handleChange}
        >
          <option value="">Seleccionar rol</option>
          {roles.map((rol) => (
            <option key={rol} value={rol.toLowerCase()}>
              {rol}
            </option>
          ))}
        </select>

        {/* Precio */}
        <label>Precio ($)</label>
        <input
          name="precio_serv"
          value={servicio.precio_serv}
          onChange={handleChange}
          type="number"
          step="0.01"
          required
        />

        {/* Duración */}
        <label>Duración</label>
        <input
          name="duracion_serv"
          value={servicio.duracion_serv || ""}
          onChange={handleChange}
          type="time"
        />

        {/* Descripción */}
        <label>Descripción</label>
        <textarea
          name="descripcion_serv"
          value={servicio.descripcion_serv || ""}
          onChange={handleChange}
          placeholder="Breve descripción del servicio..."
        />

        {/* Activo */}
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="activado"
            checked={servicio.activado}
            onChange={handleChange}
          />
          Activo
        </label>

        {/* Botones */}
        <div className="form-buttons">
          <button type="submit" className="btn-guardar">
            {id ? "Actualizar" : "Crear"}
          </button>
          <button
            type="button"
            className="btn-cancelar"
            onClick={() => navigate("/admin/dashboard/servicios")}
          >
            Cancelar
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </form>
    </div>
  );
}
