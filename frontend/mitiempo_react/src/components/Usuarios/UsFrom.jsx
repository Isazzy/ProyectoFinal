// src/components/Usuarios/UsForm.jsx

import React, { useEffect, useState } from "react";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/Usuarios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "../../CSS/ModalForm.css"; // Usaremos este archivo para los estilos del modal

const initialState = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role: "cliente", // Valor por defecto
  rol_profesional: "",
  dias_laborables: [],
};

export default function UsForm() {
  const [usuario, setUsuario] = useState(initialState);
  const navigate = useNavigate();
  const { id } = useParams(); // 'id' existe si estamos editando
  const isEditing = !!id;

  const profesiones = ["peluquera", "manicurista", "estilista", "multi"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const roles = [
    { value: "admin", label: "Administrador" },
    { value: "empleado", label: "Empleado" },
    { value: "cliente", label: "Cliente" },
  ];

  // Cargar usuario existente
  useEffect(() => {
    const loadUsuario = async () => {
      if (!isEditing) return;
      try {
        const res = await getUsuarios(id);
        const data = res.data;

        // Limpieza de datos (similar a tu lógica original, pero conservamos la hora como string)
        const dias = Array.isArray(data.dias_laborables)
          ? data.dias_laborables.map((d) =>
              typeof d === "string"
                ? { dia: d, inicio: "09:00", fin: "18:00" } // Valores por defecto si solo es un string de día
                : { dia: d.dia || "", inicio: d.inicio || "", fin: d.fin || "" }
            )
          : [];

        // NOTA: Asegúrate de no llenar el campo 'password' al editar
        setUsuario({ 
            ...data, 
            dias_laborables: dias, 
            password: "", // Nunca precargar la contraseña
        });
      } catch (err) {
        toast.error("Error al cargar el usuario");
      }
    };
    loadUsuario();
  }, [id, isEditing]);

  // Manejar cambios en inputs (unificado)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle días laborables y asegura la estructura de horario
  const handleDiaToggle = (dia) => {
    setUsuario((prev) => {
      const dias = [...prev.dias_laborables];
      const existe = dias.find((d) => d.dia === dia);
      if (existe) {
        return { ...prev, dias_laborables: dias.filter((d) => d.dia !== dia) };
      } else {
        // Añadir con horarios por defecto
        return { ...prev, dias_laborables: [...dias, { dia, inicio: "09:00", fin: "18:00" }] }; 
      }
    });
  };

  // Cambiar horarios de un día
  const handleHorarioChange = (dia, campo, valor) => {
    setUsuario((prev) => ({
      ...prev,
      dias_laborables: prev.dias_laborables.map((d) =>
        d.dia === dia ? { ...d, [campo]: valor } : d
      ),
    }));
  };

  // Guardar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 💡 Limpiar el payload: si no se cambia la contraseña, no enviarla
      const payload = { ...usuario };
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      if (isEditing) {
        await updateUsuario(id, payload);
        toast.success("Usuario modificado correctamente");
      } else {
        await createUsuario(payload);
        toast.success("Usuario creado correctamente");
      }
      
      // Cerrar el modal y volver a la lista
      navigate("/admin/dashboard/usuarios"); 
    } catch (error) {
      console.error("Error al guardar el usuario:", error.response?.data || error);
      toast.error("Error al guardar el usuario");
    }
  };

  const isEmpleado = usuario.role === "empleado" || usuario.role === "admin";
  const userFullName = `${usuario.first_name || 'Nuevo'} ${usuario.last_name || 'Usuario'}`;
  
  // Función para cerrar el modal
  const handleCancel = () => navigate("/admin/dashboard/usuarios");


  // Estructura del Modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Encabezado del Perfil (como en la imagen) */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {/* Simulación de Avatar */}
            {usuario.first_name ? usuario.first_name[0] : 'U'} 
          </div>
          <div className="profile-info-text">
            <h3 className="profile-name">{userFullName}</h3>
            <p className="profile-email-display">{usuario.email || 'email@dominio.com'}</p>
          </div>
          <div className="profile-actions-top">
          
            <button className="btn btn-view-profile">Perfil</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {/* SECCIÓN PRINCIPAL DE INFORMACIÓN (Grid de dos columnas) */}
          <div className="form-section-grid">
            
            {/* Nombre (Amélie) */}
            <div className="form-group-inline">
              <label>Nombre</label>
              <input type="text" name="first_name" value={usuario.first_name} onChange={handleChange} placeholder="Nombre" />
            </div>

            {/* Apellido (Laurent) */}
            <div className="form-group-inline">
              <label>Apellido</label>
              <input type="text" name="last_name" value={usuario.last_name} onChange={handleChange} placeholder="Apellido" />
            </div>

            {/* Email address */}
            <div className="form-group-full">
              <label>Correo electrónico</label>
              <div className="input-with-icon">
                
                <input type="email" name="email" value={usuario.email} onChange={handleChange} required placeholder="email@ejemplo.com" />
              </div>
            </div>

            {/* Username */}
            <div className="form-group-full">
              <label>Nombre de Usuario</label>
              <div className="username-input-group">
               {/* <span className="username-base">mitiempo.com/</span>*/}
                <input type="text" name="username" value={usuario.username} onChange={handleChange} required />
                
              </div>
            </div>
            
            {/* Contraseña (Solo para creación o cambio) */}
            {(!isEditing || usuario.password) && (
                 <div className="form-group-full">
                    <label>{isEditing ? "Nueva Contraseña" : "Contraseña"}</label>
                    <input type="password" name="password" value={usuario.password} onChange={handleChange} required={!isEditing} />
                </div>
            )}
          </div>
          
          {/* Profile Photo (Simulación) */}
          <div className="form-group-full profile-photo-section">
            <label>Foto de Perfil</label>
            <div className="photo-upload-box">
              <div className="current-photo">
                {/* Asume que tienes un campo de avatar en Profile */}
                <div className="profile-avatar-small">A</div> 
              </div>
             {/* <button type="button" className="btn btn-replace">Click to replace</button>*/}
            </div>
          </div>
          
          {/* SECCIÓN DE ROLES Y PROFESIÓN (Nuevos campos) */}
          <div className="form-section-fields">
              <label className="section-title-label">Permisos y Rol</label>
              
              {/* Rol */}
              <div className="form-group-full">
                <label>Rol de Usuario</label>
                <select name="role" value={usuario.role} onChange={handleChange} required>
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Profesión (solo admin o empleado) */}
              {isEmpleado && (
                <div className="form-group-full">
                  <label>Rol Profesional</label>
                  <select name="rol_profesional" value={usuario.rol_profesional || ""} onChange={handleChange}>
                    <option value="">Sin asignar</option>
                    {profesiones.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              )}
          </div>
          
          {/* SECCIÓN DE DÍAS Y HORARIOS (Moderno) */}
          {isEmpleado && (
            <div className="form-section-fields">
              <label className="section-title-label">Días y Horarios Laborales</label>
              
              {diasSemana.map((dia) => {
                const seleccionado = usuario.dias_laborables?.find((d) => d.dia === dia);
                const isChecked = !!seleccionado;
                
                return (
                  <div key={dia} className={`dia-horario-row ${isChecked ? 'active-day' : ''}`}>
                    <div className="dia-toggle">
                      <input type="checkbox" checked={isChecked} onChange={() => handleDiaToggle(dia)} id={`check-${dia}`}/>
                      <label htmlFor={`check-${dia}`}>{dia}</label>
                    </div>
                    {isChecked && (
                      <div className="horarios-inputs-group">
                        <input type="time" value={seleccionado.inicio} onChange={(e) => handleHorarioChange(dia, "inicio", e.target.value)} required />
                        <span>a</span>
                        <input type="time" value={seleccionado.fin} onChange={(e) => handleHorarioChange(dia, "fin", e.target.value)} required />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Botones del pie del modal */}
          <div className="modal-footer">
          
            <div className="footer-actions">
              <button type="button" className="btn btn-modal-cancel" onClick={handleCancel}>Cancelar</button>
              <button type="submit" className="btn btn-modal-save">Guardar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}