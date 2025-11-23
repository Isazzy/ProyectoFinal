// ========================================
// src/components/layout/MainLayout.jsx
// ========================================
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../nav/Navbar';
import { Sidebar } from '../nav/Sidebar';
import styles from '../../styles/MainLayout.module.css';

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
