import React from 'react';
import { motion } from 'framer-motion';

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
  style = {},
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 600,
    borderRadius: '1rem',
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    position: 'relative',
    overflow: 'hidden',
    ...style, // Permite sobreescribir estilos inline si es necesario
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #9B8DC5 0%, #C7BADC 100%)',
      color: 'white',
      boxShadow: '0 4px 8px rgba(155, 141, 197, 0.25)',
    },
    secondary: {
      background: '#F5F4F2',
      color: '#2C3E50',
      border: '1px solid #E8E6E3',
    },
    ghost: {
      background: 'transparent',
      color: '#2C3E50',
    },
    danger: {
      background: '#D98B8B',
      color: 'white',
      boxShadow: '0 4px 8px rgba(217, 139, 139, 0.25)',
    },
    success: {
      background: '#8FBC8F',
      color: 'white',
      boxShadow: '0 4px 8px rgba(143, 188, 143, 0.25)',
    },
    outline: {
      background: 'transparent',
      border: '2px solid #9B8DC5',
      color: '#9B8DC5',
    },
  };

  const sizes = {
    sm: { padding: '0.375rem 0.875rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '0.875rem 2rem', fontSize: '1.125rem' },
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...(fullWidth && { width: '100%' }),
    ...(disabled && { opacity: 0.6, boxShadow: 'none' }),
  };

  return (
    <motion.button
      type={type}
      style={buttonStyles}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={className} // Permite pasar clases CSS externas si usas módulos o Tailwind
      {...props}
    >
      {loading && (
        <svg
          style={{
            width: '1.25em',
            height: '1.25em',
            animation: 'spin 1s linear infinite',
            marginRight: children ? '0.5rem' : 0,
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            opacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      
      {children && <span>{children}</span>}
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </motion.button>
  );
};

export default Button;