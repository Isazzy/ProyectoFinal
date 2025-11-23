// ========================================
// src/components/ui/Input.jsx
// ========================================
import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../../styles/Input.module.css';

export const Input = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value && String(value).length > 0;
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  const handleFocus = () => setFocused(true);
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const containerClasses = classNames(
    styles.inputContainer,
    {
      [styles.focused]: focused,
      [styles.hasError]: error,
      [styles.disabled]: disabled,
      [styles.hasIcon]: Icon,
    },
    className
  );

  return (
    <div className={containerClasses}>
      <div className={styles.inputWrapper}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={20} />
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          placeholder={focused ? placeholder : ''}
          className={classNames(styles.input, inputClassName)}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        <motion.label
          className={styles.label}
          initial={false}
          animate={{
            y: focused || hasValue ? -28 : 0,
            x: focused || hasValue ? (Icon ? -32 : 0) : 0,
            scale: focused || hasValue ? 0.85 : 1,
          }}
        >
          {label}
          {required && <span className={styles.required}>*</span>}
        </motion.label>
        {isPassword && (
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {(error || helperText) && (
        <p 
          id={error ? `${props.id}-error` : undefined}
          className={classNames(styles.helperText, { [styles.errorText]: error })}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';