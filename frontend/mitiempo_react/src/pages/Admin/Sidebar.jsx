// front/src/pages/Admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCog, FaBars, FaTimes, FaChartBar, FaCalendarAlt, FaUsers,
  FaBox, FaTruck, FaShoppingCart, FaClipboardList, FaSignOutAlt
} from "react-icons/fa";
import "../../CSS/sidebar.css"; 
import defaultUser from "../../imagenes/defaultUser.png";
import { useAuth } from "../../Context/AuthContext"; 

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout: contextLogout } = useAuth(); 
  const role = user?.role || "cliente"; 

  // --- Lógica de menús y handlers (sin cambios) ---
  const adminMenu = [
    { to: "reportes", label: "Reportes", icon: <FaChartBar /> },
    { to: "agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { to: "usuarios", label: "Usuarios", icon: <FaUsers /> },
    { to: "servicios", label: "Servicios", icon: <FaClipboardList /> },
    { to: "productos", label: "Productos", icon: <FaBox /> },
    { to: "proveedores", label: "Proveedores", icon: <FaTruck /> },
    { to: "ventas", label: "Ventas", icon: <FaShoppingCart /> },
    { to: "compras", label: "Compras", icon: <FaClipboardList /> },
  ];
  const employeeMenu = [
    { to: "agenda", label: "Agenda", icon: <FaCalendarAlt /> },
    { to: "ventas", label: "Ventas", icon: <FaShoppingCart /> },
  ];
  const menuItems = role === "admin" ? adminMenu : (role === "empleado" ? employeeMenu : []);
  const handleLogout = () => {
    contextLogout();
    navigate("/login"); 
  };
  const handleProfileNav = () => {
    navigate("/admin/dashboard/perfil"); 
    setShowProfileMenu(false);
  }
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);
  // --------------------------------------------------

  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <button className="hamburger-btn" onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`logo ${isOpen ? "logo-open" : "logo-closed"}`}>
          {isOpen && (
            <>
              <p className="R">Romina Magallanez</p>
              {/* 💡 CAMBIO: Texto actualizado según tu solicitud */}
              <p className="M">M I T I E M P O</p>
            </>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.to}
              className={location.pathname.startsWith(`/admin/dashboard/${item.to}`) ? "active" : ""}
            >
              <Link to={item.to} title={!isOpen ? item.label : ""}>
                {item.icon}
                {isOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {/* ... (Contenido del footer sin cambios) ... */}
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
              <p className="email">{user?.email || "Sin email"}</p>
              <button onClick={handleProfileNav}>
                <FaUserCog /> Configuración
              </button>
              <button onClick={handleLogout}>
                <FaSignOutAlt /> Cerrar sesión
              </button>
            </div>
          )}
          
          {isOpen && (
             <div className="profile-info-open">
                <p className="username-open">{user?.first_name || user?.username}</p>
                <p className="role-open">{user?.role}</p>
             </div>
          )}
        </div>
      </div>
    </aside>
  );
}