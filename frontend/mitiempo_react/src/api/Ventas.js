// src/api/ventas.js
import api from './axiosConfig';

export const ventasAPI = {
  // Crear venta (POST /api/ventas/)
  crearVenta: async (payload) => {
    // payload debe incluir:
    // { tipo_venta, tipo_pago, turno (nullable), detalles: [{ producto, servicio, cantidad_venta, precio_unitario }] }
    const response = await api.post('/ventas/', payload);
    return response.data;
  },

  // Cobrar venta (POST /api/ventas/{id}/cobrar/ ) -> depende backend
  cobrarVenta: async (id, body = {}) => {
    const response = await api.post(`/ventas/${id}/cobrar/`, body);
    return response.data;
  },

  // Listar ventas
  getVentas: async (params = {}) => {
    const response = await api.get('/ventas/', { params });
    return response.data;
  }
};

export default ventasAPI;
