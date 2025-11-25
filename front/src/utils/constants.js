// ========================================
// src/utils/constants.js
// ========================================

export const ESTADOS_TURNO = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado',
};

export const ESTADOS_VENTA = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  ANULADO: 'anulado',
};

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mercadopago', label: 'MercadoPago' },
];

export const ROLES = {
  ADMIN: 'admin',
  EMPLEADO: 'empleado',
  CLIENTE: 'cliente',
};

export const HORARIO_TRABAJO = {
  INICIO: '09:00',
  FIN: '20:00',
  INTERVALO: 30, // minutos
};