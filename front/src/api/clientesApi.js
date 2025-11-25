// ========================================
// src/api/clientesApi.js
// ========================================
import api from './axiosConfig';

/**
 * NOTA: Asumimos que axiosConfig tiene baseURL = 'http://localhost:8000/api'
 */

export const clientesApi = {
  
  getClientes: async (params = {}) => {
    // CORRECCIÓN: Agregar 'clientes/' al final
    // Ruta final: /api/cliente/clientes/
    const response = await api.get('/cliente/clientes/', { params });
    return response.data;
  },

  getCliente: async (id) => {
    // CORRECCIÓN: Agregar 'clientes/' antes del ID
    // Ruta final: /api/cliente/clientes/{id}/
    const response = await api.get(`/cliente/clientes/${id}/`);
    return response.data;
  },

  crearCliente: async (data) => {
    // CORRECCIÓN: Agregar '/cliente/' antes de 'register/'
    // El error mostraba que 'register' está dentro del namespace 'api/cliente/'
    // Ruta final: /api/cliente/register/
    const response = await api.post('/cliente/register/', data);
    return response.data;
  },

  actualizarCliente: async (id, data) => {
    // CORRECCIÓN: Agregar 'clientes/' antes del ID
    // Ruta final: /api/cliente/clientes/{id}/
    const response = await api.put(`/cliente/clientes/${id}/`, data);
    return response.data;
  },

  eliminarCliente: async (id) => {
    // CORRECCIÓN: Agregar 'clientes/' antes del ID
    // Ruta final: /api/cliente/clientes/{id}/
    const response = await api.delete(`/cliente/clientes/${id}/`);
    return response.data;
  },
  
  // Si tienes búsqueda específica o historial, asegúrate de usar '/cliente/clientes/'
  buscarClientes: async (query) => {
    const response = await api.get('/cliente/clientes/', { params: { search: query } });
    return response.data;
  },
};