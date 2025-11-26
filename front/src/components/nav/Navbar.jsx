// ========================================
// src/components/nav/Navbar.jsx
// ========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
  Calendar,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import styles from '../../styles/Navbar.module.css';

import { useNavigate } from "react-router-dom";

const NotificationDropdown = ({ open, items, remove, close }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        width: '340px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(15,23,42,0.18)',
        padding: '12px 12px 10px',
        zIndex: 999,
        maxHeight: '420px',
        overflowY: 'auto'
      }}
    >
      <h3
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          margin: '0 0 8px 2px',
          color: '#0f172a'
        }}
      >
        Notificaciones
      </h3>

      {items.length === 0 && (
        <p
          style={{
            fontSize: '0.85rem',
            textAlign: 'center',
            padding: '14px 6px',
            color: '#6b7280'
          }}
        >
          No hay notificaciones por ahora.
        </p>
      )}

      {items.map((n) => {
        let icon = <Calendar size={18} />;
        let titulo = "Solicitud de turno";
        let bordeColor = "#4f46e5";

        if (n.estado === "cancelado") {
          icon = <AlertTriangle size={18} />;
          titulo = "Turno cancelado";
          bordeColor = "#dc2626";
        }

        if (n.comprobante_url && n.estado_pago === "seña") {
          icon = <DollarSign size={18} />;
          titulo = "Nuevo comprobante de pago";
          bordeColor = "#16a34a";
        }

        return (
          <div
            key={n.id}
            onClick={() => {
              // 🔥 BORRAR NOTIFICACIÓN
              if (remove) remove(n.id);

              // 🔥 CERRAR DROPDOWN
              if (close) close();

              // 🔥 REDIRECCIONAR
              navigate(`/turnos/${n.id}`);
            }}
            style={{
              display: "flex",
              gap: "10px",
              padding: "10px 10px",
              marginBottom: "6px",
              borderRadius: "10px",
              background: "#f9fafb",
              borderLeft: `4px solid ${bordeColor}`,
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#eef2ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#f9fafb")
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "2px",
                color: bordeColor
              }}
            >
              {icon}
            </div>

            <div style={{ flex: 1, fontSize: "0.85rem" }}>
              <strong style={{ display: "block", marginBottom: 2 }}>
                {titulo}
              </strong>

              <span style={{ display: "block", color: "#4b5563" }}>
                Cliente: {n.cliente}
              </span>

              <span
                style={{
                  display: "block",
                  color: "#6b7280",
                  fontSize: "0.8rem",
                  marginTop: 2
                }}
              >
                {new Date(n.fecha).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};


// ========================================
// NAVBAR PRINCIPAL
// ========================================
export const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { items: notificaciones } = useNotificaciones();

  const getInitials = (name) => (name ? name[0].toUpperCase() : 'U');

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.container} style={{ position: 'relative' }}>
        {/* --- IZQUIERDA: TOGGLE --- */}
        <div className={styles.left}>
          <button
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Abrir menú lateral"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>

        {/* --- CENTRO: BUSCADOR GLOBAL --- */}
        <div className={styles.center}>
          <motion.div
            className={`${styles.searchWrapper} ${
              isSearchFocused ? styles.focused : ''
            }`}
            animate={{ width: isSearchFocused ? '100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar en todo el sistema..."
              className={styles.searchInput}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {!isSearchFocused && (
              <span className={styles.searchShortcut}>⌘K</span>
            )}
          </motion.div>
        </div>

        {/* --- DERECHA: ACCIONES + PERFIL --- */}
        <div className={styles.right}>
          {/* Acciones Rápidas */}
          <div className={styles.actionsGroup}>
            {/* 🔔 BOTÓN NOTIFICACIONES */}
            <button
              className={styles.iconButton}
              aria-label="Notificaciones"
              onClick={() => setNotifOpen((prev) => !prev)}
            >
              <Bell size={20} />
              {notificaciones.length > 0 && (
                <span className={styles.notificationDot} />
              )}
            </button>

            <button className={styles.iconButton} aria-label="Configuración">
              <Settings size={20} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Perfil de Usuario */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.first_name || 'Usuario'}
              </span>
              <span className={styles.userRole}>{user?.role || 'Staff'}</span>
            </div>

            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {user?.first_name ? (
                  getInitials(user.first_name)
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
            </div>

            <button
              className={styles.logoutBtn}
              onClick={logout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* 🔽 DROPDOWN DE NOTIFICACIONES */}
        <NotificationDropdown open={notifOpen} items={notificaciones} />
      </div>
    </motion.nav>
  );
};
