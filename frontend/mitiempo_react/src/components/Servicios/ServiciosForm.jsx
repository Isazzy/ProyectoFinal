// front/src/components/Servicios/ServiciosForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createServicio,
  updateServicio,
  getServicioById,
} from "../../api/servicios";

// 💡 1. Importamos el nuevo CSS
import "../../CSS/ServiciosForm.css";

// --- Constantes (sin cambios) ---
const DIAS_SEMANA = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
];
const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function ServiciosForm() {
  const [servicio, setServicio] = useState({
    nombre_serv: "",
    tipo_serv: "",
    precio_serv: "",
    duracion_minutos: 0, 
    dias_disponibles: [], 
    descripcion_serv: "",
    activado: true,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  const tiposServicio = ["Peluquería", "Uñas", "Maquillaje", "Varios"];

  // --- Lógica (sin cambios) ---
  useEffect(() => {
    const cargarServicio = async () => {
      if (id) {
        try {
          const res = await getServicioById(id);
          const data = res.data;
          setServicio({
            ...data,
            precio_serv: data.precio_serv || 0,
            duracion_minutos: data.duracion_minutos || 0,
            dias_disponibles: data.dias_disponibles || [],
          });
        } catch (err) {
          console.error("Error al cargar servicio:", err);
          setError("Error al cargar el servicio.");
        }
      }
    };
    cargarServicio();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServicio((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDiasChange = (e) => {
    const { value, checked } = e.target;
    setServicio((prev) => {
      const dias = prev.dias_disponibles || [];
      if (checked) {
        return { ...prev, dias_disponibles: [...new Set([...dias, value])] };
      } else {
        return { ...prev, dias_disponibles: dias.filter(dia => dia !== value) };
      }
    });
  };

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
      duracion_minutos: parseInt(servicio.duracion_minutos, 10) || 0,
      dias_disponibles: servicio.dias_disponibles || [],
    };
    
    delete payload.duracion_serv; 
    delete payload.rol_requerido;

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
  // ---------------------------------

  return (
    // 💡 Usa la clase global .form-container
    <div className="form-container">
      <h2>{id ? "Editar Servicio" : "Nuevo Servicio"}</h2>

      <form onSubmit={handleSubmit}>
        
        {/* 💡 2. Usa la clase global .alert */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Los campos .form-group, .form-input, .form-select
            ya heredan estilos globales de App.css */}
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
        
        {/* 💡 3. Usa la clase .form-grid-2 del nuevo CSS */}
        <div className="form-grid-2">
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
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="duracion_minutos">Duración (minutos)</label>
            <input
              id="duracion_minutos"
              name="duracion_minutos"
              className="form-input"
              value={servicio.duracion_minutos || ""}
              onChange={handleChange}
              type="number"
              min="0"
              step="5"
            />
          </div>
        </div>

        {/* 💡 4. Usa clases del nuevo CSS */}
        <div className="form-group">
          <label>Días Disponibles</label>
          <div className="checkbox-group-horizontal">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`dia-${dia}`}
                  name="dias_disponibles"
                  value={dia}
                  checked={(servicio.dias_disponibles || []).includes(dia)}
                  onChange={handleDiasChange}
                />
                <label htmlFor={`dia-${dia}`}>{capitalizar(dia)}</label>
              </div>
            ))}
          </div>
        </div>

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

        {/* 💡 5. Usa la clase .checkbox-group del nuevo CSS */}
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

        {/* 💡 6. Usa clases globales de App.css */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/dashboard/servicios")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            {id ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
      
      {/* 💡 7. Bloque <style> eliminado */}
    </div>
  );
}