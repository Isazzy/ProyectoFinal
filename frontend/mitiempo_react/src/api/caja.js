// src/api/caja.js


import api from './axiosConfig';  // Importa la instancia de Axios configurada

// Función para listar todas las cajas (GET /api/cajas/)
// Soporta filtros por query params (ej. ?caja_estado=true)
export const getCajas = async (params = {}) => {
  try {
    const response = await api.get('cajas/', { params });  // params: ej. { caja_estado: true, ordering: '-caja_fecha_hora_apertura' }
    return response.data.results || response.data;  // Maneja paginación: usa results si existe, sino data
  } catch (error) {
    console.error('Error al obtener cajas:', error);
    throw error;
  }
};

// Función para crear una nueva caja (POST /api/cajas/)
// Data debe incluir campos como caja_monto_inicial (ej. { caja_monto_inicial: 100.00 })
export const createCaja = async (cajaData) => {
  try {
    const response = await api.post('cajas/', cajaData);
    return response.data;  // Retorna la caja creada
  } catch (error) {
    console.error('Error al crear caja:', error);
    throw error;
  }
};

// Función para obtener una caja específica (GET /api/cajas/{id}/)
export const getCaja = async (id) => {
  try {
    const response = await api.get(`cajas/${id}/`);
    return response.data;  // Retorna la caja con transacciones anidadas y campos calculados
  } catch (error) {
    console.error('Error al obtener caja:', error);
    throw error;
  }
};

// Función para actualizar una caja (PUT /api/cajas/{id}/)
// Data puede incluir campos como caja_observacion o caja_saldo_final (para cierre parcial)
export const updateCaja = async (id, cajaData) => {
  try {
    const response = await api.put(`cajas/${id}/`, cajaData);
    return response.data;  // Retorna la caja actualizada
  } catch (error) {
    console.error('Error al actualizar caja:', error);
    throw error;
  }
};

// Función para eliminar una caja (DELETE /api/cajas/{id}/)
// Solo si el usuario tiene permisos (admin o propietario)
export const deleteCaja = async (id) => {
  try {
    await api.delete(`cajas/${id}/`);
    return true;  // Éxito, no retorna data
  } catch (error) {
    console.error('Error al eliminar caja:', error);
    throw error;
  }
};

// Función para abrir una nueva caja (POST /api/cajas/abrir/)
// Data debe incluir caja_monto_inicial (ej. { caja_monto_inicial: 50.00 })
// Verifica automáticamente si ya hay una abierta
export const abrirCaja = async (cajaData) => {
  console.log('Datos enviados:', JSON.stringify(cajaData));
  try {
    const response = await api.post('cajas/abrir/', cajaData);
    return response.data;  // Retorna la caja abierta
  } catch (error) {
    console.error('Error al abrir caja:', error.response?.data || error);  // Agrega .data para ver el detalle del backend
    throw error;
  }
};

// Función para cerrar una caja específica (POST /api/cajas/{id}/cerrar/)
// Data puede incluir caja_saldo_final y caja_observacion (ej. { caja_saldo_final: 150.00, caja_observacion: 'Cierre diario' })
// Calcula saldo automáticamente si no se proporciona
export const cerrarCaja = async (id, cierreData) => {
  try {
    const response = await api.post(`cajas/${id}/cerrar/`, cierreData);
    return response.data;  // Retorna la caja cerrada con campos actualizados
  } catch (error) {
    console.error('Error al cerrar caja:', JSON.stringify(error.response?.data) || error);  // Agrega JSON.stringify
    throw error;
  }
};

// Función para listar solo cajas abiertas (GET /api/cajas/abiertas/)
// Útil para dashboards
export const getCajasAbiertas = async () => {
  try {
    const response = await api.get('cajas/abiertas/');
    return response.data.results || response.data;  // Ídem retorna cajas abiertas
  } catch (error) {
    console.error('Error al obtener cajas abiertas:', error);
    throw error;
  }
};