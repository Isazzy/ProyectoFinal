// ========================================
// src/components/nav/Sidebar.jsx
// ========================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, Scissors, ShoppingBag, Users, 
  User, Package, X, DollarSign, Truck 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import styles from '../../styles/Sidebar.module.css';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home }, 
  { path: '/turnos', label: 'Agenda', icon: Calendar },
  { path: '/servicios', label: 'Servicios', icon: Scissors },
  { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
  { path: '/compras', label: 'Compras', icon: Truck },
  { path: '/caja', label: 'Caja', icon: DollarSign }, 
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/empleados', label: 'Equipo', icon: User, adminOnly: true },
];

export const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useUI();

  // Filtrar ítems según rol
  const filteredItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  // Handler para cerrar solo en móvil al hacer clic
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  return (
    <>
      {/* Overlay para Móviles (Fondo oscuro) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Principal */}
      <motion.aside
        className={styles.sidebar}
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header / Logo */}
        <div className={styles.header}>
          <h2 className={styles.logo}>Mi Tiempo</h2>
          <button 
            className={styles.closeButton}
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lista de Navegación */}
        <nav className={styles.nav}>
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <div className={styles.navItemInner}>
                <item.icon size={20} strokeWidth={2} />
                <span>{item.label}</span>
              </div>
              {/* Indicador visual activo (opcional, manejado por CSS) */}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.version}>Versión 1.0.0</p>
          <p className={styles.copyright}>© 2024 Mi Tiempo</p>
        </div>
      </motion.aside>
    </>
  );
};