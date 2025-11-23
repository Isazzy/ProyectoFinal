// ========================================
// src/components/nav/Navbar.jsx
// ========================================
import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import styles from '../../styles/Navbar.module.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className={styles.container}>
        {/* Left section */}
        <div className={styles.left}>
          <button 
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <h1 className={styles.logo}>Mi Tiempo</h1>
        </div>

        {/* Center - Search */}
        <div className={styles.center}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar..."
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Right section */}
        <div className={styles.right}>
          <button className={styles.iconButton} aria-label="Notificaciones">
            <Bell size={20} />
            <span className={styles.badge} />
          </button>
          
          <button className={styles.iconButton} aria-label="Configuración">
            <Settings size={20} />
          </button>

          <div className={styles.userSection}>
            <div className={styles.avatar}>
              {user?.nombre?.[0] || 'U'}
            </div>
            <span className={styles.userName}>{user?.nombre || 'Usuario'}</span>
            <button 
              className={styles.iconButton}
              onClick={logout}
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};