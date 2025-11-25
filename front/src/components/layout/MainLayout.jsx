// ========================================
// src/components/layout/MainLayout.jsx
// ========================================
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../nav/Sidebar';
import { Navbar } from '../nav/Navbar';
import { useUI } from '../../context/UIContext';
import styles from '../../styles/MainLayout.module.css';

export const MainLayout = () => {
  const { sidebarOpen } = useUI();

  return (
    <div className={styles.layoutWrapper}>
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenedor Principal que se desplaza */}
      <div 
        className={`${styles.mainContainer} ${sidebarOpen ? styles.shifted : ''}`}
      >
        <Navbar />
        
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};