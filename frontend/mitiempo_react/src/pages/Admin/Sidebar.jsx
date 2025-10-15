import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../../CSS/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  //  Obtener usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "cliente"; // por defecto “cliente” si no hay usuario

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  //  Opciones dinámicas según el rol
  const menuByRole = {
    admin: [
      { to: "/admin/dashboard/agenda", label: "Agenda" },
      { to: "/admin/dashboard/servicios", label: "Servicios" },
      { to: "/admin/dashboard/usuarios", label: "Usuarios" },
      { to: "/admin/dashboard/reportes", label: "Reportes" },
    ],
    empleado: [
      { to: "/empleado/agenda", label: "Agenda" },
      { to: "/empleado/servicios", label: "Servicios" },
    ],
    cliente: [
      { to: "/servicios", label: "Servicios" },
      { to: "/turnos", label: "Mis Turnos" },
    ],
  };

  const menuItems = menuByRole[role] || [];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">
        {role === "admin"
          ? "Panel Admin"
          : role === "empleado"
          ? "Panel Empleado"
          : "Mi Cuenta"}
      </h2>

      <nav>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.to}
              className={location.pathname.includes(item.to) ? "active" : ""}
            >
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-user">
           {user?.username || "Invitado"} ({role})
        </p>
        <button className="sidebar-logout" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
