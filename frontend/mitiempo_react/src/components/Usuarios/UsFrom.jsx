// front/src/components/Usuarios/UsForm.jsx
import React, { useEffect, useState } from "react";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/Usuarios";
import toast from "react-hot-toast";

// 💡 1. Importa el Modal genérico
import Modal from "../Common/Modal";

const initialState = {
  username: "", first_name: "", last_name: "", email: "",
  password: "", role: "cliente", rol_profesional: "",
  dias_laborables: [],
};

export default function UsForm({ userId, onClose }) {
  const [usuario, setUsuario] = useState(initialState);
  
  // 💡 2. 'id' ahora es 'userId' (de las props)
  const isEditing = !!userId; 

  const profesiones = ["peluquera", "manicurista", "estilista", "multi"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "empleado", label: "Empleado" },
    { value: "cliente", label: "Cliente" },
  ];

  // 💡 3. useEffect ahora depende de 'userId'
  useEffect(() => {
    const loadUsuario = async () => {
      if (!isEditing) {
        setUsuario(initialState); // Resetea si es para crear
        return;
      }
      try {
        const res = await getUsuarios(userId);
        const data = res.data;
        
        // Limpieza de datos (tu lógica era buena)
        const dias = Array.isArray(data.dias_laborables)
          ? data.dias_laborables.map((d) =>
              typeof d === "string"
                ? { dia: d, inicio: "09:00", fin: "18:00" }
                : { dia: d.dia || "", inicio: d.inicio || "09:00", fin: d.fin || "18:00" }
            )
          : [];

        setUsuario({ ...data, dias_laborables: dias, password: "" });
      } catch (err) {
        toast.error("Error al cargar el usuario");
      }
    };
    loadUsuario();
  }, [userId, isEditing]);

  // Manejadores (handleChange, handleDiaToggle, handleHorarioChange)
  // (Tu lógica aquí es perfecta, no necesita cambios)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };
  const handleDiaToggle = (dia) => {
    setUsuario((prev) => {
      const dias = [...prev.dias_laborables];
      const existe = dias.find((d) => d.dia === dia);
      if (existe) {
        return { ...prev, dias_laborables: dias.filter((d) => d.dia !== dia) };
      } else {
        return { ...prev, dias_laborables: [...dias, { dia, inicio: "09:00", fin: "18:00" }] }; 
      }
    });
  };
  const handleHorarioChange = (dia, campo, valor) => {
    setUsuario((prev) => ({
      ...prev,
      dias_laborables: prev.dias_laborables.map((d) =>
        d.dia === dia ? { ...d, [campo]: valor } : d
      ),
    }));
  };
  // ----------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...usuario };
      if (isEditing && !payload.password) { // No enviar pass vacío al editar
        delete payload.password;
      }

      if (isEditing) {
        await updateUsuario(userId, payload);
        toast.success("Usuario modificado correctamente");
      } else {
        await createUsuario(payload);
        toast.success("Usuario creado correctamente");
      }
      
      // 💡 4. Llama a onClose(true) para cerrar y refrescar la lista
      onClose(true); 
    } catch (error) {
      console.error("Error al guardar el usuario:", error.response?.data || error);
      toast.error("Error al guardar el usuario");
    }
  };

  const isEmpleado = usuario.role === "empleado" || usuario.role === "admin";
  
  // 💡 5. El componente ahora retorna el <Modal> genérico
  return (
    <Modal
      isOpen={true} // Siempre está abierto si se renderiza
      onClose={() => onClose(false)} // Llama a onClose(false) si se cancela
      title={isEditing ? `Editar Usuario: ${usuario.first_name}` : "Crear Nuevo Usuario"}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => onClose(false)}>
            Cancelar
          </button>
          {/* 💡 El botón de submit debe apuntar al <form> */}
          <button type="submit" form="user-form-id" className="btn btn-primary">
            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </>
      }
    >
      {/* 💡 6. El formulario ahora usa clases globales */}
      <form id="user-form-id" onSubmit={handleSubmit} className="form-container-modal">
        
        {/* SECCIÓN PRINCIPAL (Grid 2 columnas) */}
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="first_name">Nombre</label>
            <input id="first_name" type="text" name="first_name" value={usuario.first_name} onChange={handleChange} placeholder="Nombre" className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Apellido</label>
            <input id="last_name" type="text" name="last_name" value={usuario.last_name} onChange={handleChange} placeholder="Apellido" className="form-input" />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" name="email" value={usuario.email} onChange={handleChange} required placeholder="email@ejemplo.com" className="form-input" />
        </div>
        
        {/* Username */}
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input id="username" type="text" name="username" value={usuario.username} onChange={handleChange} required className="form-input" />
        </div>
        
        {/* Contraseña */}
        <div className="form-group">
          <label htmlFor="password">{isEditing ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}</label>
          <input id="password" type="password" name="password" value={usuario.password} onChange={handleChange} required={!isEditing} className="form-input" />
        </div>

        {/* --- SECCIÓN ROLES Y PROFESIÓN --- */}
        <div className="form-section">
          <h4>Permisos y Rol</h4>
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="role">Rol de Usuario</label>
              <select id="role" name="role" value={usuario.role} onChange={handleChange} required className="form-select">
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            
            {/* Solo muestra Profesión si es Empleado o Admin */}
            {isEmpleado && (
              <div className="form-group">
                <label htmlFor="rol_profesional">Rol Profesional</label>
                <select id="rol_profesional" name="rol_profesional" value={usuario.rol_profesional || ""} onChange={handleChange} className="form-select">
                  <option value="">Sin asignar</option>
                  {profesiones.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* --- SECCIÓN HORARIOS (Tu lógica) --- */}
        {isEmpleado && (
          <div className="form-section">
            <h4>Días y Horarios Laborales</h4>
            {diasSemana.map((dia) => {
              const seleccionado = usuario.dias_laborables?.find((d) => d.dia === dia);
              const isChecked = !!seleccionado;
              
              return (
                <div key={dia} className={`dia-horario-row ${isChecked ? 'active' : ''}`}>
                  <div className="checkbox-group">
                    <input type="checkbox" checked={isChecked} onChange={() => handleDiaToggle(dia)} id={`check-${dia}`}/>
                    <label htmlFor={`check-${dia}`}>{dia}</label>
                  </div>
                  {isChecked && (
                    <div className="horarios-inputs-group">
                      <input type="time" value={seleccionado.inicio} onChange={(e) => handleHorarioChange(dia, "inicio", e.target.value)} required className="form-input" />
                      <span>a</span>
                      <input type="time" value={seleccionado.fin} onChange={(e) => handleHorarioChange(dia, "fin", e.target.value)} required className="form-input" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </form>
      
      {/* 💡 7. CSS local para este formulario específico (coherente con el tema) */}
      <style>{`
        .form-container-modal { 
          /* Contenedor dentro del modal */
        }
        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-section {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          margin-top: 1rem;
        }
        .form-section h4 {
          color: var(--text-color);
          margin-bottom: 1rem;
        }
        .dia-horario-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .dia-horario-row:last-child { border-bottom: none; }
        .dia-horario-row .checkbox-group { margin: 0; }
        .dia-horario-row.active { background-color: rgba(251, 91, 91, 0.05); } 
        
        .horarios-inputs-group { display: flex; align-items: center; gap: 8px; }
        .horarios-inputs-group span { color: var(--text-color-muted); }
        .horarios-inputs-group .form-input { 
          width: 120px; 
          padding: 8px;
        }
        @media (max-width: 600px) {
          .form-grid-2 { grid-template-columns: 1fr; }
          .horarios-inputs-group { flex-direction: column; align-items: flex-end; }
        }
      `}</style>
    </Modal>
  );
}