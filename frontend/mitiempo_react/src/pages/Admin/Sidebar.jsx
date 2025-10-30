// front/src/pages/Admin/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCog, FaBars, FaTimes, FaChartBar, FaCalendarAlt, FaUsers,
  FaBox, FaTruck, FaShoppingCart, FaClipboardList, FaSignOutAlt
} from "react-icons/fa";
import "../../CSS/sidebar.css"; // Importamos el CSS
import defaultUser from "../../imagenes/defaultUser.png";

// 💡 1. Importar el contexto de autenticación
import { useAuth } from "../../Context/AuthContext"; 

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // 💡 2. Obtener 'user' y 'logout' del contexto
  const { user, logout: contextLogout } = useAuth(); 
  const role = user?.role || "cliente"; // 'user' viene del contexto

  // 💡 3. Definir menús para admin y empleado
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

  // 💡 4. Asignar menú según el rol
  const menuItems = role === "admin" ? adminMenu : (role === "empleado" ? employeeMenu : []);

  // 💡 5. Usar la función 'logout' del contexto
  const handleLogout = () => {
    contextLogout();
    navigate("/login"); // Redirigir a login al salir
  };
  
  const handleProfileNav = () => {
    // Ruta para que admin/empleado editen su propio perfil
    navigate("/admin/dashboard/perfil"); 
    setShowProfileMenu(false);
  }
  
  // Cerrar el menú de perfil si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

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
              <p className="M">Mi Tiempo</p>
            </>
          )}
        </div>
      </div>

      {/* 💡 6. Contenedor de menú con scroll y flex-grow */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.to}
              // Comprueba si la ruta *comienza* con el 'to'
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
        <div className="profile-container">
          <img
            src={user?.avatar || defaultUser} // 💡 7. 'user' desde el contexto
            alt="Perfil"
            className="profile-pic"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />

          {showProfileMenu && (
            <div className="profile-menu">
              {/* 💡 8. Datos del 'user' desde el contexto */}
              <p className="username">{user?.username || "Usuario"}</p>
              <p className="email">{user?.email || "Sin email"}</p>
              
              <button onClick={handleProfileNav}>
                <FaUserCog /> Configuración
              </button>
              <button onClick={handleLogout}> {/* 💡 9. Usa handleLogout */}
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