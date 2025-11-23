// ========================================
// src/utils/formatters.js
// ========================================

/**
 * Format number as currency (ARS)
 */
export const formatCurrency = (amount, currency = 'ARS') => {
  if (amount === null || amount === undefined) return '$0';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to localized string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('es-AR', defaultOptions).format(d);
};

/**
 * Format date as short (DD/MM/YYYY)
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('es-AR');
};

/**
 * Format time (HH:MM)
 */
export const formatTime = (time) => {
  if (!time) return '';
  // If it's already in HH:MM format, return as is
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  // If it's a date object or ISO string
  const d = typeof time === 'string' ? new Date(time) : time;
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Get relative time (hace X minutos, etc)
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return formatDateShort(d);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};