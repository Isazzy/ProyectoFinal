// ========================================
// src/components/nav/Navbar.jsx
// ========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, Bell, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUI } from '../../context/UIContext';
import styles from '../../styles/Navbar.module.css';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Helper para obtener iniciales
  const getInitials = (name) => name ? name[0].toUpperCase() : 'U';

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.container}>
        
        {/* --- SECCIÓN IZQUIERDA: TOGGLE Y MARCA --- */}
        <div className={styles.left}>
          <button 
            className={styles.menuButton}
            onClick={toggleSidebar}
            aria-label="Abrir menú lateral"
          >
            <Menu size={24} strokeWidth={2} />
          </button>
          
          {/* En móvil el logo puede ir aquí si el sidebar está cerrado, 
              pero generalmente se deja en el sidebar. Aquí mostramos el título de la sección actual o breadcrumbs si quisieras */}
        </div>

        {/* --- SECCIÓN CENTRAL: BUSCADOR GLOBAL --- */}
        <div className={styles.center}>
          <motion.div 
            className={`${styles.searchWrapper} ${isSearchFocused ? styles.focused : ''}`}
            animate={{ width: isSearchFocused ? '100%' : '100%' }} // Opcional: animar ancho
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
            {/* Atajo de teclado visual (opcional) */}
            {!isSearchFocused && <span className={styles.searchShortcut}>⌘K</span>}
          </motion.div>
        </div>

        {/* --- SECCIÓN DERECHA: ACCIONES Y PERFIL --- */}
        <div className={styles.right}>
          
          {/* Acciones Rápidas */}
          <div className={styles.actionsGroup}>
            <button className={styles.iconButton} aria-label="Notificaciones">
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </button>
            
            <button className={styles.iconButton} aria-label="Configuración">
              <Settings size={20} />
            </button>
          </div>

          <div className={styles.divider}></div>

          {/* Perfil de Usuario */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.first_name || 'Usuario'}</span>
                <span className={styles.userRole}>{user?.role || 'Staff'}</span>
            </div>
            
            <div className={styles.avatarWrapper}>
                <div className={styles.avatar}>
                    {user?.first_name ? getInitials(user.first_name) : <UserIcon size={18} />}
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
      </div>
    </motion.nav>
  );
};