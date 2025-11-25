// ========================================
// src/api/serviciosApi.js
// ========================================
import api from './axiosConfig';

export const serviciosApi = {

  getServicios: async (params = {}) => {
    const response = await api.get('/servicio/servicios/', { params });
    return response.data;
  },

  getServicio: async (id_serv) => {
    if (!id_serv) throw new Error("ID de servicio faltante (undefined)");
    const response = await api.get(`/servicio/servicios/${id_serv}/`);
    return response.data;
  },

  crearServicio: async (data) => {
    const response = await api.post('/servicio/servicios/', data);
    return response.data;
  },

  actualizarServicio: async (id_serv, data) => {
    if (!id_serv) throw new Error("ID de servicio faltante para actualizar");
    const response = await api.put(`/servicio/servicios/${id_serv}/`, data);
    return response.data;
  },

  eliminarServicio: async (id_serv) => {
    if (!id_serv) throw new Error("ID de servicio faltante para eliminar");
    const response = await api.delete(`/servicio/servicios/${id_serv}/`);
    return response.data;
  },

  toggleActivo: async (id_serv) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.patch(`/servicio/servicios/${id_serv}/activo/`);
    return response.data;
  },

  // NUEVO: Obtener lista de insumos para el selector
  getInsumosDisponibles: async (q = '') => {
    // El backend espera ?q=nombre
    const response = await api.get('/servicio/insumos/disponibles/', { params: { q } });
    return response.data;
  },

};