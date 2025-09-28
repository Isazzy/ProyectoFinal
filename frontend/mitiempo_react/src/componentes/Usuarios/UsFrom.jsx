import React, { useEffect, useState } from "react";
import { createUsuarios, getUsuario, updateUsuario } from "../../api/Usuarios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import "../../CSS/usuarios.css";

export default function UsForm() {
  const [Usuario, setUsuario] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    usuario: "",
    contrasena: "",
    rol_usuario: "",
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
      await updateUsuario(params.id, Usuario);
      toast.success("Usuario modificado correctamente");
    } else {
      await createUsuarios(Usuario);
      toast.success("Usuario creado correctamente");
    }
    navigate("/Usuarios");
  };

  return (
    <div className="container">
      <h2>{params.id ? "Editar Usuario" : "Crear Usuario"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre</label>
          <input
            value={Usuario.nombre_usuario}
            type="text"
            onChange={(e) =>
              setUsuario({ ...Usuario, nombre_usuario: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Apellido</label>
          <input
            value={Usuario.apellido_usuario}
            type="text"
            onChange={(e) =>
              setUsuario({ ...Usuario, apellido_usuario: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Usuario</label>
          <input
            value={Usuario.usuario}
            type="text"
            onChange={(e) => setUsuario({ ...Usuario, usuario: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            value={Usuario.contrasena}
            type="password"
            onChange={(e) =>
              setUsuario({ ...Usuario, contrasena: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Rol de usuario</label>
          <input
            value={Usuario.rol_usuario}
            type="text"
            onChange={(e) =>
              setUsuario({ ...Usuario, rol_usuario: e.target.value })
            }
          />
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

