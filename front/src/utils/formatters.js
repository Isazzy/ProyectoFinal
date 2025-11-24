// ========================================
// src/utils/formatters.js
// ========================================

/**
 * Helper interno para crear fechas de forma segura
 * Evita el problema de Timezone en fechas "YYYY-MM-DD"
 */
const safeDate = (dateInput) => {
  if (!dateInput) return null;
  
  // Si es objeto Date, devolverlo
  if (dateInput instanceof Date) return dateInput;

  // Si es string
  if (typeof dateInput === 'string') {
    // Si es formato ISO completo (tiene T) o tiene hora explícita, dejarlo pasar tal cual
    if (dateInput.includes('T') || dateInput.includes(':')) {
      return new Date(dateInput);
    }
    // Si es solo fecha (YYYY-MM-DD), agregar T00:00:00 para evitar desfasaje de zona horaria
    return new Date(`${dateInput}T00:00:00`);
  }

  return new Date(dateInput); // Timestamp numérico u otros
};

/**
 * Format number as currency (ARS)
 */
export const formatCurrency = (amount, currency = 'ARS') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$ 0';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2, // Cambiado a 2 para ver centavos si los hay
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date to localized string (Ej: 24 de noviembre de 2025)
 */
export const formatDate = (date, options = {}) => {
  const d = safeDate(date);
  if (!d || isNaN(d.getTime())) return '-'; // Retorna guión si es inválida
  
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
  const d = safeDate(date);
  if (!d || isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format time (HH:MM)
 */
export const formatTime = (time) => {
  if (!time) return '--:--';

  // Si ya viene como string HH:mm o HH:mm:ss
  if (typeof time === 'string') {
    // Si es HH:mm retorna directo
    if (time.match(/^\d{2}:\d{2}$/)) return time;
    // Si es HH:mm:ss (formato Django TimeField), cortar segundos
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) return time.slice(0, 5);
  }

  // Si es fecha ISO o Date object
  const d = safeDate(time);
  if (!d || isNaN(d.getTime())) return '--:--';

  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const str = String(phone);
  const cleaned = str.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return str;
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes) => {
  const m = parseInt(minutes);
  if (!m || isNaN(m)) return '0 min';
  
  if (m < 60) return `${m} min`;
  
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

/**
 * Get relative time (hace X minutos, etc)
 */
export const formatRelativeTime = (date) => {
  const d = safeDate(date);
  if (!d || isNaN(d.getTime())) return '';
  
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
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  const s = String(str);
  if (s.length <= maxLength) return s;
  return s.slice(0, maxLength) + '...';
};