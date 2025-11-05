// front/src/components/Usuarios/UsForm.jsx
import React, { useEffect, useState } from "react";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/Usuarios";
import toast from "react-hot-toast";
import Modal from "../Common/Modal";

// 💡 1. Importamos el nuevo archivo CSS
import "../../CSS/UsForm.css";

const initialState = {
  username: "", first_name: "", last_name: "", email: "",
  password: "", role: "cliente", rol_profesional: "",
  dias_laborables: [],
};

export default function UsForm({ userId, onClose }) {
  const [usuario, setUsuario] = useState(initialState);
  
  const isEditing = !!userId; 

  const profesiones = ["peluquera", "manicurista", "estilista", "multi"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "empleado", label: "Empleado" },
    { value: "cliente", label: "Cliente" },
  ];

  useEffect(() => {
    const loadUsuario = async () => {
      if (!isEditing) {
        setUsuario(initialState); 
        return;
      }
      try {
        const res = await getUsuarios(userId);
        const data = res.data;
        
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
      if (isEditing && !payload.password) { 
        delete payload.password;
      }

      if (isEditing) {
        await updateUsuario(userId, payload);
        toast.success("Usuario modificado correctamente");
      } else {
        await createUsuario(payload);
        toast.success("Usuario creado correctamente");
      }
      
      onClose(true); 
    } catch (error) {
      console.error("Error al guardar el usuario:", error.response?.data || error);
      toast.error("Error al guardar el usuario");
    }
  };

  const isEmpleado = usuario.role === "empleado" || usuario.role === "admin";
  
  return (
    <Modal
      isOpen={true} 
      onClose={() => onClose(false)} 
      title={isEditing ? `Editar Usuario: ${usuario.first_name}` : "Crear Nuevo Usuario"}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => onClose(false)}>
            Cancelar
          </button>
          <button type="submit" form="user-form-id" className="btn btn-primary">
            {isEditing ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </>
      }
    >
      {/* 💡 2. Clases globales y locales (de UsForm.css) en uso */}
      <form id="user-form-id" onSubmit={handleSubmit} className="form-container-modal">
        
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

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" type="email" name="email" value={usuario.email} onChange={handleChange} required placeholder="email@ejemplo.com" className="form-input" />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input id="username" type="text" name="username" value={usuario.username} onChange={handleChange} required className="form-input" />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{isEditing ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}</label>
          <input id="password" type="password" name="password" value={usuario.password} onChange={handleChange} required={!isEditing} className="form-input" />
        </div>

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
      
      {/* 💡 3. Bloque <style> eliminado */}
    </Modal>
  );
}