// front/src/components/Servicios/ServiciosForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createServicio,
  updateServicio,
  getServicioById,
} from "../../api/servicios";
// 💡 CSS eliminado, ya no se importa

export default function ServiciosForm() {
  const [servicio, setServicio] = useState({
    nombre_serv: "",
    tipo_serv: "",
    precio_serv: "",
    duracion_serv: "", // Se maneja como "HH:mm"
    descripcion_serv: "",
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
          const data = res.data;

          // Convertir "HH:mm:ss" a "HH:mm" para el input type="time"
          if (data.duracion_serv && data.duracion_serv.length === 8) {
            data.duracion_serv = data.duracion_serv.substring(0, 5);
          }

          setServicio(data);
        } catch (err) {
          console.error("Error al cargar servicio:", err);
          setError("Error al cargar el servicio.");
        }
      }
    };
    cargarServicio();
  }, [id]);

  // Manejar cambios en los inputs (lógica sin cambios)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServicio((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Guardar cambios (lógica sin cambios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!servicio.nombre_serv || !servicio.tipo_serv || !servicio.precio_serv) {
      setError("Nombre, tipo y precio son obligatorios.");
      return;
    }

    // Convertir "HH:mm" de vuelta a "HH:mm:ss" para Django
    let duracion_formateada = null;
    if (servicio.duracion_serv && servicio.duracion_serv.length === 5) { 
      duracion_formateada = `${servicio.duracion_serv}:00`; 
    }

    const payload = {
      ...servicio,
      precio_serv: parseFloat(servicio.precio_serv),
      duracion_serv: duracion_formateada,
    };

    try {
      if (id) {
        await updateServicio(id, payload);
      } else {
        await createServicio(payload);
      }
      navigate("/admin/dashboard/servicios");
    } catch (err) {
      console.error("Error al guardar servicio:", err.response?.data || err);
      setError("Error al guardar el servicio.");
    }
  };

  return (
    // 💡 1. Contenedor de formulario global
    <div className="form-container">
      <h2>{id ? "Editar Servicio" : "Nuevo Servicio"}</h2>

      {/* 💡 2. Formulario con la estructura global */}
      <form onSubmit={handleSubmit}>
        
        {/* Error */}
        {error && <p className="message error">{error}</p>}

        {/* Nombre */}
        <div className="form-group">
          <label htmlFor="nombre_serv">Nombre del servicio</label>
          <input
            id="nombre_serv"
            name="nombre_serv"
            className="form-input"
            value={servicio.nombre_serv}
            onChange={handleChange}
            placeholder="Ej: Corte de cabello"
            required
          />
        </div>

        {/* Tipo */}
        <div className="form-group">
          <label htmlFor="tipo_serv">Tipo de servicio</label>
          <select
            id="tipo_serv"
            name="tipo_serv"
            className="form-select"
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
        </div>

        {/* Rol requerido */}
        <div className="form-group">
          <label htmlFor="rol_requerido">Rol requerido</label>
          <select
            id="rol_requerido"
            name="rol_requerido"
            className="form-select"
            value={servicio.rol_requerido || ""}
            onChange={handleChange}
          >
            <option value="">Seleccionar rol</option>
            {roles.map((rol) => (
              // 💡 (Tu lógica de .toLowerCase() era correcta)
              <option key={rol} value={rol.toLowerCase()}>
                {rol}
              </option>
            ))}
          </select>
        </div>
        
        {/* Grilla para Precio y Duración */}
        <div className="form-grid-2">
          {/* Precio */}
          <div className="form-group">
            <label htmlFor="precio_serv">Precio ($)</label>
            <input
              id="precio_serv"
              name="precio_serv"
              className="form-input"
              value={servicio.precio_serv}
              onChange={handleChange}
              type="number"
              step="0.01"
              required
            />
          </div>

          {/* Duración */}
          <div className="form-group">
            <label htmlFor="duracion_serv">Duración (HH:mm)</label>
            <input
              id="duracion_serv"
              name="duracion_serv"
              className="form-input"
              value={servicio.duracion_serv || ""}
              onChange={handleChange}
              type="time" 
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="form-group">
          <label htmlFor="descripcion_serv">Descripción</label>
          <textarea
            id="descripcion_serv"
            name="descripcion_serv"
            className="form-textarea"
            value={servicio.descripcion_serv || ""}
            onChange={handleChange}
            placeholder="Breve descripción del servicio..."
          />
        </div>

        {/* Activo */}
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="activado"
            name="activado"
            checked={servicio.activado}
            onChange={handleChange}
          />
          <label htmlFor="activado">Servicio Activo</label>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary" // 💡 3. Clase global
            onClick={() => navigate("/admin/dashboard/servicios")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary"> {/* 💡 4. Clase global */}
            {id ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
      
      {/* CSS para la grilla de 2 columnas (similar a Register.css) */}
      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}