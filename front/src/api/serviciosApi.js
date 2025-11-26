import api from './axiosConfig';

// Ajusta este prefijo según tu 'urls.py' principal. 
// Por lo que vi en tus logs, parece ser '/servicio' o '/api/servicio'.
const MODULE_URL = '/servicio'; 

export const serviciosApi = {

  getServicios: async (params = {}) => {
    // params puede incluir { activo: false } para traer inactivos
    const response = await api.get(`${MODULE_URL}/servicios/`, { params });
    return response.data;
  },

  getServicio: async (id_serv) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.get(`${MODULE_URL}/servicios/${id_serv}/`);
    return response.data;
  },

  crearServicio: async (data) => {
    const response = await api.post(`${MODULE_URL}/servicios/`, data);
    return response.data;
  },

  actualizarServicio: async (id_serv, data) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.put(`${MODULE_URL}/servicios/${id_serv}/`, data);
    return response.data;
  },

  // --- NUEVO: PATCH para reactivar o modificaciones parciales ---
  patchServicio: async (id_serv, data) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.patch(`${MODULE_URL}/servicios/${id_serv}/`, data);
    return response.data;
  },

  // --- CRÍTICO: Devolvemos 'response' completo (NO .data) ---
  // Esto permite al Hook leer response.status (204 vs 200) y response.data.action
  eliminarServicio: async (id_serv) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.delete(`${MODULE_URL}/servicios/${id_serv}/`);
    return response; 
  },

  // Endpoint específico de toggle (opcional, si prefieres usar patchServicio es lo mismo)
  toggleActivo: async (id_serv, activo) => {
    if (!id_serv) throw new Error("ID de servicio faltante");
    const response = await api.patch(`${MODULE_URL}/servicios/${id_serv}/activo/`, { activo });
    return response.data;
  },

  getInsumosDisponibles: async (q = '') => {
    const response = await api.get(`${MODULE_URL}/insumos/disponibles/`, { params: { q } });
    return response.data;
  },
};