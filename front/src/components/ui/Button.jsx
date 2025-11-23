// ========================================
// src/components/ui/Button.jsx
// ========================================
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from '../../styles/Button.module.css';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
  outline: 'btn-outline',
};

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.btn,
    styles[variants[variant]],
    styles[sizes[size]],
    {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: loading,
      [styles.iconOnly]: Icon && !children,
    },
    className
  );

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading && (
        <span className={styles.spinner}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.spinnerIcon}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </motion.button>
  );
};

