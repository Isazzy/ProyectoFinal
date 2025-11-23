// ========================================
// src/components/ui/Badge.jsx
// ========================================
import React from 'react';
import classNames from 'classnames';
import styles from '../../styles/Badge.module.css';

const variants = {
  default: 'default',
  primary: 'primary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const badgeClasses = classNames(
    styles.badge,
    styles[variants[variant]],
    styles[size],
    { [styles.withDot]: dot },
    className
  );

  return (
    <span className={badgeClasses}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
};