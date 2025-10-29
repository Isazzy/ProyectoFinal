// front/src/pages/Admin/Sidebar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCog,
  FaBars,
  FaTimes,
  FaChartBar,
  FaCalendarAlt,
  FaUsers,
  FaBox,
  FaTruck,
  FaShoppingCart,
  FaClipboardList,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../CSS/sidebar.css";
import defaultUser from "../../imagenes/defaultUser.png";


export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "cliente";

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const adminMenu = [
    { to: "/admin/dashboard/reportes", label: "Reportes", icon: <FaChartBar /> },
    { to: "/admin/dashboard/agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { to: "/admin/dashboard/usuarios", label: "Usuarios", icon: <FaUsers /> },
    { to: "/admin/dashboard/servicios", label: "Servicios", icon: <FaClipboardList /> },
    { to: "/admin/dashboard/productos", label: "Productos", icon: <FaBox /> },
    { to: "/admin/dashboard/proveedores", label: "Proveedores", icon: <FaTruck /> },
    { to: "/admin/dashboard/ventas", label: "Ventas", icon: <FaShoppingCart /> },
    { to: "/admin/dashboard/compras", label: "Compras", icon: <FaClipboardList /> },
  ];

  const menuItems = role === "admin" ? adminMenu : [];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      {/* Encabezado del Sidebar */}
      <div className="sidebar-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logo */}
        <div className={`logo ${isOpen ? "logo-open" : "logo-closed"}`}>
          {isOpen && (
            <>
            <p className="R">Romina Magallanez </p>
            <p className="M">Mi Tiempo </p>
            </>
            )}
        </div>
      </div>

      {/* Menú de navegación */}
      <nav>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.to}
              className={location.pathname.includes(item.to) ? "active" : ""}
            >
              <Link to={item.to} title={!isOpen ? item.label : ""}>
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Pie del Sidebar */}
      <div className="sidebar-footer">
       

        {/* Foto de perfil */}
        <div className="profile-container">
          <img
            src={user?.avatar || defaultUser}
            alt="Perfil"
            className="profile-pic"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />

          {showProfileMenu && (
            <div className="profile-menu">
              <p className="username">{user?.username || "Usuario"}</p>
              <p className="email">{user?.email || "correo@ejemplo.com"}</p>
              <button onClick={() => navigate("/perfil")}>
                <FaUserCog /> Configuración
              </button>
              <button onClick={logout}>
                <FaSignOutAlt /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
