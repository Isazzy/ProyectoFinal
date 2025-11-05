// front/src/components/Usuarios/UsFrom.jsx
import React, { useEffect, useState } from "react";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/Usuarios";
import toast from "react-hot-toast";
import Modal from "../Common/Modal";
import "../../CSS/UsForm.css";

const initialState = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  telefono: "", // ✅ nuevo campo
  password: "",
  groups: ["Cliente"],
};

export default function UsForm({ userId, onClose }) {
  const [usuario, setUsuario] = useState(initialState);
  const isEditing = !!userId;

  const grupos = [
    { value: "Administrador", label: "Administrador" },
    { value: "Empleado", label: "Empleado" },
    { value: "Cliente", label: "Cliente" },
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
        setUsuario({
          ...data,
          telefono: data.telefono || "", // ✅ aseguramos valor
          password: "",
          groups: data.groups && data.groups.length > 0 ? data.groups : ["Cliente"],
        });
      } catch (err) {
        toast.error("Error al cargar el usuario");
      }
    };
    loadUsuario();
  }, [userId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupChange = (e) => {
    setUsuario((prev) => ({ ...prev, groups: [e.target.value] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...usuario };
      if (isEditing && !payload.password) delete payload.password;

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
      <form id="user-form-id" onSubmit={handleSubmit} className="form-container-modal">
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="first_name">Nombre</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={usuario.first_name}
              onChange={handleChange}
              placeholder="Nombre"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Apellido</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={usuario.last_name}
              onChange={handleChange}
              placeholder="Apellido"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            value={usuario.email}
            onChange={handleChange}
            required
            placeholder="email@ejemplo.com"
            className="form-input"
          />
        </div>

        {/* ✅ NUEVO CAMPO TELÉFONO */}
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="text"
            name="telefono"
            value={usuario.telefono}
            onChange={handleChange}
            placeholder="Ej: +56 9 1234 5678"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Nombre de Usuario</label>
          <input
            id="username"
            type="text"
            name="username"
            value={usuario.username}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            {isEditing ? "Nueva Contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={usuario.password}
            onChange={handleChange}
            required={!isEditing}
            className="form-input"
          />
        </div>

        <div className="form-section">
          <h4>Rol y Permisos</h4>
          <div className="form-group">
            <label htmlFor="groups">Grupo</label>
            <select
              id="groups"
              name="groups"
              value={usuario.groups?.[0] || "Cliente"}
              onChange={handleGroupChange}
              required
              className="form-select"
            >
              {grupos.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
