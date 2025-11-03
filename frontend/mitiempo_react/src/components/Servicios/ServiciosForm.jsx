import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createServicio,
  updateServicio,
  getServicioById,
} from "../../api/servicios";

// --- Constantes para los nuevos campos ---
const DIAS_SEMANA = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"
];

const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export default function ServiciosForm() {
  const [servicio, setServicio] = useState({
    nombre_serv: "",
    tipo_serv: "",
    precio_serv: "",
    // --- CAMBIO ---
    duracion_minutos: 0, // Reemplaza a duracion_serv
    dias_disponibles: [], // Nuevo campo
    // --- FIN CAMBIO ---
    descripcion_serv: "",
    activado: true,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  // Opciones predefinidas
  const tiposServicio = ["Peluquería", "Uñas", "Maquillaje", "Varios"];
  // 'roles' ya no es necesario

  // Cargar servicio existente si hay ID
  useEffect(() => {
    const cargarServicio = async () => {
      if (id) {
        try {
          const res = await getServicioById(id);
          const data = res.data;

          // --- CAMBIO ---
          // La lógica de conversión de 'duracion_serv' se elimina.
          // El serializer ahora envía los campos correctos.
          setServicio({
            ...data,
            // Aseguramos que los valores sean del tipo correcto
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

  // Manejar cambios en los inputs (genérico)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setServicio((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- CAMBIO ---
  // Nuevo handler para los checkboxes de días
  const handleDiasChange = (e) => {
    const { value, checked } = e.target;
    setServicio((prev) => {
      const dias = prev.dias_disponibles || [];
      if (checked) {
        // Añadir el día (evitando duplicados)
        return { ...prev, dias_disponibles: [...new Set([...dias, value])] };
      } else {
        // Quitar el día
        return { ...prev, dias_disponibles: dias.filter(dia => dia !== value) };
      }
    });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!servicio.nombre_serv || !servicio.tipo_serv || !servicio.precio_serv) {
      setError("Nombre, tipo y precio son obligatorios.");
      return;
    }

    // --- CAMBIO ---
    // Se elimina la lógica de 'duracion_formateada'.
    // Creamos el payload con los nuevos campos.
    const payload = {
      ...servicio,
      precio_serv: parseFloat(servicio.precio_serv),
      duracion_minutos: parseInt(servicio.duracion_minutos, 10) || 0,
      dias_disponibles: servicio.dias_disponibles || [],
    };
    
    // Eliminamos campos que el serializer ya no espera
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

  return (
    <div className="form-container">
      <h2>{id ? "Editar Servicio" : "Nuevo Servicio"}</h2>

      <form onSubmit={handleSubmit}>
        
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

        {/* --- CAMBIO ---
            Se elimina el <select> de 'rol_requerido'
        */}
        
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
              min="0"
              required
            />
          </div>

          {/* --- CAMBIO --- Duración en Minutos */}
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

        {/* --- CAMBIO --- Nuevo campo Días Disponibles */}
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
                  // Comprobamos si el día está en el array del estado
                  checked={(servicio.dias_disponibles || []).includes(dia)}
                  onChange={handleDiasChange}
                />
                <label htmlFor={`dia-${dia}`}>{capitalizar(dia)}</label>
              </div>
            ))}
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
      
      {/* Estilos para los nuevos campos */}
      <style>{`
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .checkbox-group-horizontal {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 8px;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .checkbox-item label {
          margin: 0;
          font-weight: 400;
          cursor: pointer;
        }
        .checkbox-item input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
          .checkbox-group-horizontal {
             flex-direction: column;
             gap: 0.75rem;
             align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}