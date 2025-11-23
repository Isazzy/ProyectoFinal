// ========================================
// src/components/layout/AuthLayout.jsx
// ========================================
import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from '../../styles/AuthLayout.module.css';

export const AuthLayout = () => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.background} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};