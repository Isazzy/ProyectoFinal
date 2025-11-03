// front/src/pages/Admin/Sidebar.jsx
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

import defaultUser from "../../imagenes/defaultUser.png";
import "../../CSS/sidebar.css";

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
              </button>
            </div>
          )}
        </div>
      </CSidebarNav>
    </CSidebar>
  );
}
