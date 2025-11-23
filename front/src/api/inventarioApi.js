// ========================================
// src/api/inventarioApi.js
// ========================================
import api from './axiosConfig';

export const inventarioApi = {
  getInsumos: async (params = {}) => {
    const response = await api.get('/insumos/', { params });
    return response.data;
  },

  getInsumo: async (id) => {
    const response = await api.get(`/insumos/${id}/`);
    return response.data;
  },

  crearInsumo: async (data) => {
    const response = await api.post('/insumos/', data);
    return response.data;
  },

  actualizarInsumo: async (id, data) => {
    const response = await api.put(`/insumos/${id}/`, data);
    return response.data;
  },

  eliminarInsumo: async (id) => {
    const response = await api.delete(`/insumos/${id}/`);
    return response.data;
  },

  actualizarStock: async (id, cantidad, tipo = 'ingreso') => {
    const response = await api.post(`/insumos/${id}/movimiento/`, {
      cantidad,
      tipo, // 'ingreso' | 'egreso'
    });
    return response.data;
  },

  getInsumosStockBajo: async () => {
    const response = await api.get('/insumos/', { params: { stock_bajo: true } });
    return response.data;
  },

  getMovimientos: async (insumoId, params = {}) => {
    const response = await api.get(`/insumos/${insumoId}/movimientos/`, { params });
    return response.data;
  },
};