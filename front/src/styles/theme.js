// ========================================
// MI TIEMPO - Theme Configuration
// ========================================

export const theme = {
  colors: {
    bg: '#F7F7F9',
    surface: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',
    primary: '#6C63FF',
    primaryLight: '#8B85FF',
    primaryDark: '#5650E6',
    accent: '#FFB86B',
    accentLight: '#FFD4A8',
    muted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)',
    accent: 'linear-gradient(135deg, #FFB86B 0%, #FFD4A8 100%)',
    hero: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(255, 184, 107, 0.1) 100%)',
  },
  
  fonts: {
    display: "'Great Vibes', cursive",
    body: "'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'SF Mono', 'Fira Code', monospace",
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    hover: '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
  
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Status colors mapping
export const statusColors = {
  pendiente: { bg: theme.colors.warningLight, text: theme.colors.warning },
  confirmado: { bg: `${theme.colors.primary}20`, text: theme.colors.primary },
  completado: { bg: theme.colors.successLight, text: theme.colors.success },
  cancelado: { bg: theme.colors.dangerLight, text: theme.colors.danger },
  pagado: { bg: theme.colors.successLight, text: theme.colors.success },
  activo: { bg: theme.colors.successLight, text: theme.colors.success },
  inactivo: { bg: theme.colors.borderLight, text: theme.colors.textMuted },
};

// Framer Motion variants
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

export default theme;