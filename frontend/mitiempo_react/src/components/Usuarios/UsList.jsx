import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../CSS/usuarios.css";

export default function UsList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      const res = await getUsuarios();
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUsuario(id);
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        toast.success("Usuario eliminado correctamente");
      } catch (error) {
        toast.error("No se pudo eliminar el usuario");
      }
    }
  };

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="container">
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button
          className="btn btn-add"
          onClick={() => navigate("/usuarios/create")}
        >
          ➕ Crear Usuario
        </button>
      </div>

      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => navigate(`/usuarios/edit/${u.id}`)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(u.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
