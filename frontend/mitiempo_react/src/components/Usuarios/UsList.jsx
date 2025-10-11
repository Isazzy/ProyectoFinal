// front/src/componentes/Usuarios/UsList.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { deleteUsuario, getUsuarios } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import "../../CSS/usuarios.css";

export default function UsList() {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const loadUsuarios = async () => {
    try {
      const response = await getUsuarios();
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("No se pudieron cargar los usuarios");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUsuario(id);
      toast.success("Usuario eliminado correctamente");
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error("No se pudo eliminar el usuario");
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  return (
    <div className="container">
      <h1>Gestión de Personal</h1>
      <button
        className="btn btn-add"
        onClick={() => navigate("/crear-usuario")}
      >
        + Agregar Usuario
      </button>

      <div className="user-list">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="user-card">
            <p>
              <b>Usuario:</b> {usuario.username}
            </p>
            <p>
              <b>Nombre:</b> {usuario.first_name} {usuario.last_name}
            </p>
            <p>
              <b>Email:</b> {usuario.email}
            </p>
            <p>
              <b>Rol:</b> {usuario.role}
            </p>

            <div className="user-actions">
              <button
                onClick={() => navigate(`/editar-usuario/${usuario.id}`)}
                className="btn btn-edit"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(usuario.id)}
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
