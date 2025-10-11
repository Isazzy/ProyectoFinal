//componentes/Usuarios/UsForm.jsx
import React, { useEffect, useState } from "react";
import { createUsuarios, getUsuario, updateUsuario } from "../../api/Usuarios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "../../CSS/usuarios.css";

export default function UsForm() {
  const [usuario, setUsuario] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const loadUsuarios = async () => {
      if (params.id) {
        const response = await getUsuario(params.id);
        setUsuario(response.data);
      }
    };
    loadUsuarios();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (params.id) {
      await updateUsuario(params.id, usuario);
      toast.success("Usuario modificado correctamente");
    } else {
      await createUsuarios(usuario);
      toast.success("Usuario creado correctamente");
    }
    navigate("/Usuarios");
  };

  return (
    <div className="container">
      <h2>{params.id ? "Editar Usuario" : "Crear Usuario"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de usuario</label>
          <input
            value={usuario.username}
            type="text"
            onChange={(e) =>
              setUsuario({ ...usuario, username: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input
            value={usuario.first_name}
            type="text"
            onChange={(e) =>
              setUsuario({ ...usuario, first_name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            value={usuario.last_name}
            type="text"
            onChange={(e) =>
              setUsuario({ ...usuario, last_name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            value={usuario.email}
            type="email"
            onChange={(e) =>
              setUsuario({ ...usuario, email: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            value={usuario.password}
            type="password"
            onChange={(e) =>
              setUsuario({ ...usuario, password: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Rol</label>
          <select
            value={usuario.role}
            onChange={(e) => setUsuario({ ...usuario, role: e.target.value })}
          >
            <option value="">Seleccionar rol</option>
            <option value="admin">Administrador</option>
            <option value="empleado">Empleado</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        <button className="btn btn-save">Guardar</button>
        <button
          type="button"
          className="btn btn-cancel"
          onClick={() => navigate("/Usuarios")}
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
