// ========================================
// src/utils/validators.js
// ========================================

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone (Argentina)
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const minLength = (value, min) => {
  return value && value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value, max) => {
  return !value || value.length <= max;
};

/**
 * Validate number in range
 */
export const inRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate positive number
 */
export const isPositive = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate future date
 */
export const isFutureDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};

/**
 * Form validation helper
 */
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const validationRules = {
  required: (msg = 'Campo requerido') => (value) => 
    !isRequired(value) ? msg : null,
  
  email: (msg = 'Email inválido') => (value) => 
    value && !isValidEmail(value) ? msg : null,
  
  minLength: (min, msg) => (value) => 
    value && value.length < min ? (msg || `Mínimo ${min} caracteres`) : null,
  
  maxLength: (max, msg) => (value) => 
    value && value.length > max ? (msg || `Máximo ${max} caracteres`) : null,
  
  phone: (msg = 'Teléfono inválido') => (value) => 
    value && !isValidPhone(value) ? msg : null,
  
  positive: (msg = 'Debe ser mayor a 0') => (value) => 
    value && !isPositive(value) ? msg : null,
  
  match: (fieldName, msg) => (value, data) => 
    value !== data[fieldName] ? (msg || 'Los campos no coinciden') : null,
};
