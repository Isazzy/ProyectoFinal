// src/components/Usuarios/UsForm.jsx
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
    rol_profesional: "",
    dias_laborables: [],
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const profesiones = ["peluquera", "manicurista", "estilista", "multi"];
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  // Cargar usuario existente
  useEffect(() => {
    const loadUsuario = async () => {
      if (!id) return;
      try {
        const res = await getUsuarios(id);
        const data = res.data;

        // Asegurar que dias_laborables sea un array de objetos { dia, inicio, fin }
        const dias = Array.isArray(data.dias_laborables)
          ? data.dias_laborables.map((d) =>
              typeof d === "string"
                ? { dia: d, inicio: "", fin: "" }
                : { dia: d.dia || "", inicio: d.inicio || "", fin: d.fin || "" }
            )
          : [];

        setUsuario({ ...data, dias_laborables: dias });
      } catch (err) {
        toast.error("Error al cargar el usuario");
      }
    };
    loadUsuario();
  }, [id]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle días laborables
  const handleDiaToggle = (dia) => {
    setUsuario((prev) => {
      const dias = [...prev.dias_laborables];
      const existe = dias.find((d) => d.dia === dia);
      if (existe) {
        return { ...prev, dias_laborables: dias.filter((d) => d.dia !== dia) };
      } else {
        return { ...prev, dias_laborables: [...dias, { dia, inicio: "", fin: "" }] };
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
      console.log("Payload enviado:", usuario);
      if (id) {
        await updateUsuario(id, usuario);
        toast.success("Usuario modificado correctamente");
      } else {
        await createUsuario(usuario);
        toast.success("Usuario creado correctamente");
      }
      navigate("/admin/dashboard/usuarios");
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      if (error.response?.data) console.error("Detalles:", error.response.data);
      toast.error("Error al guardar el usuario");
    }
  };

  const isEmpleado = usuario.role === "empleado" || usuario.role === "admin";

  return (
    <div className="container">
      <h2>{id ? "Editar Usuario" : "Crear Usuario"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="form-group">
          <label>Nombre de usuario</label>
          <input
            type="text"
            value={usuario.username}
            onChange={(e) => setUsuario({ ...usuario, username: e.target.value })}
            required
          />
        </div>

        {/* Nombre */}
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            value={usuario.first_name}
            onChange={(e) => setUsuario({ ...usuario, first_name: e.target.value })}
          />
        </div>

        {/* Apellido */}
        <div className="form-group">
          <label>Apellido</label>
          <input
            type="text"
            value={usuario.last_name}
            onChange={(e) => setUsuario({ ...usuario, last_name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={usuario.email}
            onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
            required
          />
        </div>

        {/* Contraseña solo si es nuevo */}
        {!id && (
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={usuario.password}
              onChange={(e) => setUsuario({ ...usuario, password: e.target.value })}
              required
            />
          </div>
        )}

        {/* Rol */}
        <div className="form-group">
          <label>Rol</label>
          <select name="role" value={usuario.role} onChange={handleChange} required>
            <option value="">Seleccionar rol</option>
            <option value="admin">Administrador</option>
            <option value="empleado">Empleado</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        {/* Profesión (solo admin o empleado) */}
        {isEmpleado && (
          <div className="form-group">
            <label>Profesión</label>
            <select
              name="rol_profesional"
              value={usuario.rol_profesional || ""}
              onChange={handleChange}
            >
              <option value="">Seleccionar profesión</option>
              {profesiones.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Días y horarios (solo admin o empleado) */}
        {isEmpleado && (
          <div className="form-group horarios-section">
            <label>Días y horarios laborales</label>
            {diasSemana.map((dia) => {
              const seleccionado = usuario.dias_laborables?.find((d) => d.dia === dia);
              return (
                <div key={dia} className="dia-horario">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!seleccionado}
                      onChange={() => handleDiaToggle(dia)}
                    />
                    {dia}
                  </label>
                  {seleccionado && (
                    <div className="horarios-inputs">
                      <input
                        type="time"
                        value={seleccionado.inicio}
                        onChange={(e) => handleHorarioChange(dia, "inicio", e.target.value)}
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={seleccionado.fin}
                        onChange={(e) => handleHorarioChange(dia, "fin", e.target.value)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Botones */}
        <div className="button-group">
          <button className="btn btn-save" type="submit">
            Guardar
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate("/admin/dashboard/usuarios")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
