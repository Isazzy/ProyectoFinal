// ========================================
// src/components/nav/Sidebar.jsx
// ========================================
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calendar, Scissors, ShoppingBag, Users, 
  User, Package, X, CreditCard 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import styles from '../../styles/Sidebar.module.css';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/turnos', label: 'Turnos', icon: Calendar },
  { path: '/servicios', label: 'Servicios', icon: Scissors },
  { path: '/ventas', label: 'Ventas', icon: ShoppingBag },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/empleados', label: 'Empleados', icon: User, adminOnly: true },
  { path: '/inventario', label: 'Inventario', icon: Package },
];

export const Sidebar = () => {
  const { isAdmin } = useAuth();
  const { sidebarOpen, closeSidebar } = useUI();
  const location = useLocation();

  const filteredItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Overlay for mobile */}
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

      {/* Sidebar */}
      <motion.aside
        className={styles.sidebar}
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
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

        <nav className={styles.nav}>
          {filteredItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <motion.div
                className={styles.navItemInner}
                whileHover={{ x: 4 }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.div>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <p className={styles.version}>v1.0.0</p>
        </div>
      </motion.aside>
    </>
  );
};