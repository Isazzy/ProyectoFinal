import React, { useEffect, useState } from "react";
import { createUsuario, getUsuarios, updateUsuario } from "../../api/Usuarios";
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
  const { id } = useParams();

  useEffect(() => {
    const loadUsuario = async () => {
      if (id) {
        try {
          const res = await getUsuarios(id);
          setUsuario(res.data);
        } catch (err) {
          toast.error("Error al cargar el usuario");
        }
      }
    };
    loadUsuario();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUsuario(id, usuario);
        toast.success("Usuario modificado correctamente");
      } else {
        await createUsuario(usuario);
        toast.success("Usuario creado correctamente");
      }
      navigate("/usuarios");
    } catch (err) {
      toast.error("Error al guardar el usuario");
    }
  };

  return (
    <div className="container">
      <h2>{id ? "Editar Usuario" : "Crear Usuario"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre de usuario</label>
          <input
            type="text"
            value={usuario.username}
            onChange={(e) =>
              setUsuario({ ...usuario, username: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={usuario.first_name}
            onChange={(e) =>
              setUsuario({ ...usuario, first_name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            value={usuario.last_name}
            onChange={(e) =>
              setUsuario({ ...usuario, last_name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={usuario.email}
            onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
            required
          />
        </div>

        {!id && (
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={usuario.password}
              onChange={(e) =>
                setUsuario({ ...usuario, password: e.target.value })
              }
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Rol</label>
          <select
            value={usuario.role}
            onChange={(e) => setUsuario({ ...usuario, role: e.target.value })}
            required
          >
            <option value="">Seleccionar rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Empleado">Empleado</option>
            <option value="Cliente">Cliente</option>
          </select>
        </div>

        <div className="button-group">
          <button className="btn btn-save" type="submit">
            Guardar
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate("/usuarios")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
