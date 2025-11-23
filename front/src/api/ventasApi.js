// ========================================
// src/api/ventasApi.js
// ========================================
import api from './axiosConfig';

export const ventasApi = {
  getVentas: async (params = {}) => {
    const response = await api.get('/ventas/', { params });
    return response.data;
  },

  getVenta: async (id) => {
    const response = await api.get(`/ventas/${id}/`);
    return response.data;
  },

  crearVenta: async (data) => {
    // data: { cliente_id, turno_id?, servicios, productos, metodo_pago }
    const response = await api.post('/ventas/', data);
    return response.data;
  },

  anularVenta: async (id) => {
    const response = await api.patch(`/ventas/${id}/`, { estado: 'anulado' });
    return response.data;
  },

  getVentasDia: async (fecha) => {
    const response = await api.get('/ventas/', { params: { fecha } });
    return response.data;
  },

  getResumenVentas: async (fechaInicio, fechaFin) => {
    const response = await api.get('/ventas/resumen/', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },
};