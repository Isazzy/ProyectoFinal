import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteUsuario, getUsuarios } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import "../../CSS/usuarios.css";

export default function UsList() {
  const [Usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const loadUsuarios = async () => {
    const response = await getUsuarios();
    setUsuarios(response.data);
  };

  const handleDelete = async (id) => {
    await deleteUsuario(id);
    toast.success("Usuario eliminado correctamente");
    setUsuarios(Usuarios.filter((usuario) => usuario.id_usuario !== id));
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  return (
    <div className="container">
      <h1>Gestión de Personal</h1>
      <button className="btn btn-add" onClick={() => navigate("/crear-usuario")}>
        + Agregar Usuario
      </button>

      <div className="user-list">
        {Usuarios.map((usuario) => (
          <div key={usuario.id_usuario} className="user-card">
            <p><b>Nombre:</b> {usuario.nombre_usuario}</p>
            <p><b>Apellido:</b> {usuario.apellido_usuario}</p>
            <p><b>Usuario:</b> {usuario.usuario}</p>
            <p><b>Rol:</b> {usuario.rol_usuario}</p>

            <div className="user-actions">
              <button
                onClick={() => navigate(`/editar-usuario/${usuario.id_usuario}`)}
                className="btn btn-edit"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(usuario.id_usuario)}
                className="btn btn-delete"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
