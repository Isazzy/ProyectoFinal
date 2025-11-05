// front/src/pages/Admin/Sidebar.jsx
<<<<<<< HEAD
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavItem,
  CNavGroup,
  CNavTitle,
  CBadge,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
  cilMenu,
  cilX,
  cilSpeedometer,
  cilCalendar,
  cilUser,
  cilListRich,
  cilInbox,
  cilTruck,
  cilCart,
  cilReportSlash,
  cilSettings,
  cilAccountLogout,
  cilInfo,
} from "@coreui/icons";

=======
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUserCog, FaBars, FaTimes, FaChartBar, FaCalendarAlt, FaUsers,
  FaBox, FaTruck, FaShoppingCart, FaClipboardList, FaSignOutAlt
} from "react-icons/fa";
<<<<<<< HEAD
import "../../CSS/sidebar.css"; // Importamos el CSS
>>>>>>> 874e3164 (reestructuracion de archivos)
import defaultUser from "../../imagenes/defaultUser.png";
import "../../CSS/sidebar.css";

<<<<<<< HEAD
/**
 * Props:
 * - isOpen (bool): estado visible del sidebar
 * - toggleSidebar (fn): alterna visible
 * - persistState (bool): si true, guarda "sidebar:isOpen" en localStorage
 */
export default function AdminSidebar({
  isOpen,
  toggleSidebar,
  persistState = true,
}) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // --- LocalStorage safe read ---
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const role = user?.role || "cliente";

  // --- Persistir estado (opcional) ---
  useEffect(() => {
    if (!persistState) return;
    try {
      localStorage.setItem("sidebar:isOpen", JSON.stringify(!!isOpen));
    } catch {
      /* noop */
    }
  }, [isOpen, persistState]);

  // --- Menús por rol (mantiene equivalentes a tu Sidebar anterior) ---
  const menus = useMemo(
    () => ({
      admin: [
        { to: "/admin/dashboard/reportes", label: "Reportes", icon: cilSpeedometer },
        { to: "/admin/dashboard/agenda", label: "Agenda", icon: cilCalendar },
        { to: "/admin/dashboard/usuarios", label: "Usuarios", icon: cilUser },
        { to: "/admin/dashboard/servicios", label: "Servicios", icon: cilListRich },
        { to: "/admin/dashboard/productos", label: "Productos", icon: cilInbox },
        { to: "/admin/dashboard/proveedores", label: "Proveedores", icon: cilTruck },
        { to: "/admin/dashboard/ventas", label: "Ventas", icon: cilCart },
        { to: "/admin/dashboard/compras", label: "Compras", icon: cilListRich },
      ],
      cliente: [
        { to: "/ayuda", label: "Ayuda", icon: cilInfo },
      ],
    }),
    []
  );

  const menuItems = menus[role] || menus["cliente"];

  const logout = () => {
    try {
      localStorage.clear();
    } catch { /* noop */ }
    navigate("/login");
  };

  // --- Cerrar menú perfil al click afuera / Escape ---
  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleImgError = (e) => {
    e.currentTarget.src = defaultUser;
  };

  return (
    <CSidebar
      className="border-end"
      visible
      onVisibleChange={toggleSidebar}
      position="fixed" 
      unfoldable// muestra modo "estrecho" con íconos cuando se colapsa
    >
      <CSidebarHeader className="border-bottom flex items-center justify-between px-3">
        <CSidebarBrand className="flex items-center gap-2">
          {/* Botón toggle (opcional): si preferís en layout padre, podés quitarlo */}
          <button
            className="c-sidebar-toggle-btn"
            onClick={() => toggleSidebar(!isOpen)}
            aria-label={isOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
            aria-expanded={isOpen}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CIcon icon={isOpen ? cilX : cilMenu} />
          </button>

          {/* Branding */}
          <span className="font-semibold">
            {isOpen ? (
              <>
                Romina Magallanez <span className="opacity-60">· Mi Tiempo</span>
              </>
            ) : (
              "Mi Tiempo"
            )}
          </span>
        </CSidebarBrand>
      </CSidebarHeader>

      <CSidebarNav>
        {/* Título / Sección */}
        {role === "admin" && <CNavTitle>Panel de Administración</CNavTitle>}

        {/* Items simples */}
        {menuItems.map((item) => (
          <CNavItem
            key={item.to}
            component={NavLink}
            to={item.to}
            // className dinámica con NavLink v6
            className={({ isActive }) => (isActive ? "active" : undefined)}
            // tooltip cuando está plegado (CoreUI ya muestra hover, pero dejamos title)
            title={!isOpen ? item.label : undefined}
          >
            <CIcon customClassName="nav-icon" icon={item.icon} />
            {item.label}
          </CNavItem>
        ))}

        {/* Ejemplo de grupo (si querés agrupar) */}
        <CNavGroup
          toggler={
            <>
              <CIcon customClassName="nav-icon" icon={cilListRich} /> Gestión
            </>
          }
        >
          <CNavItem component={NavLink} to="/admin/dashboard/servicios">
            Servicios
          </CNavItem>
          <CNavItem component={NavLink} to="/admin/dashboard/productos">
            Productos
          </CNavItem>
        </CNavGroup> 

        {/* Enlace de ayuda fijo (como en el anterior footer) */}
        <CNavItem
          component={NavLink}
          to="/ayuda"
          className={({ isActive }) => (isActive ? "active" : undefined)}
          title={!isOpen ? "Ayuda" : undefined}
        >
          <CIcon customClassName="nav-icon" icon={cilInfo} /> Ayuda{" "}
          <CBadge color="primary" className="ms-auto">
            FAQ
          </CBadge>
        </CNavItem>

        {/* Separador visual */}
        <CNavTitle>Cuenta</CNavTitle>

        {/* Perfil + menú */}
        <div
          ref={profileRef}
          className="px-3 pb-3 mt-2"
          style={{ position: "relative" }}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowProfileMenu((s) => !s)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setShowProfileMenu((s) => !s);
            }}
            aria-haspopup="menu"
            aria-expanded={showProfileMenu}
            title={!isOpen ? (user?.username || "Usuario") : undefined}
          >
            <img
              src={user?.avatar || defaultUser}
              alt="Foto de perfil"
              onError={handleImgError}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            {isOpen && (
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.username || "Usuario"}
                </div>
                <div className="text-xs opacity-70 truncate">
                  {user?.email || "correo@ejemplo.com"}
                </div>
              </div>
            )}
          </div>

          {showProfileMenu && (
            <div
              role="menu"
              className="rounded shadow-lg bg-white border"
              style={{
                position: "absolute",
                left: isOpen ? 12 : 56,
                right: isOpen ? 12 : "auto",
                top: "calc(100% + 8px)",
                zIndex: 1000,
                minWidth: isOpen ? 220 : 180,
                padding: 8,
              }}
            >
              <button
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate("/perfil");
                }}
              >
                <CIcon icon={cilSettings} /> Configuración
              </button>
              <button
                role="menuitem"
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-red-600"
                onClick={logout}
              >
                <CIcon icon={cilAccountLogout} /> Cerrar sesión
=======
// 💡 1. Importar el contexto de autenticación
=======
import "../../CSS/sidebar.css"; 
import defaultUser from "../../imagenes/defaultUser.png";
>>>>>>> 632fee59 (Cambios)
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
>>>>>>> 874e3164 (reestructuracion de archivos)
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
      </CSidebarNav>
    </CSidebar>
  );
}