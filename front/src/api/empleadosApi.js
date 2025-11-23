// ========================================
// src/api/empleadosApi.js
// ========================================
import api from './axiosConfig';

/**
 * NOTA: Asumiendo que tu axiosConfig tiene baseURL = 'http://localhost:8000/api'
 * Las rutas abajo se concatenan: /api + /empleado/list/
 */

export const empleadosApi = {
  
  // CORRECCIÓN: Agregar 'list/' al final
  getEmpleados: async (params = {}) => {
    const response = await api.get('/empleado/list/', { params });
    return response.data;
  },

  // Nota: No tienes una URL específica para "ver detalle" (read-only) en tu urls.py
  // Usualmente se usa la misma de update si soporta GET, o se crea una nueva.
  // Por ahora, si esto falla, es porque falta path('<int:pk>/', ...) en urls.py
  getEmpleado: async (id) => {
    // Si usas el UpdateView para leer datos previos:
    const response = await api.get(`/empleado/update/${id}/`); 
    return response.data;
  },

  // CORRECCIÓN: Agregar 'create/' al final
  crearEmpleado: async (data) => {
    const response = await api.post('/empleado/create/', data);
    return response.data;
  },

  // CORRECCIÓN: Agregar 'update/' antes del ID
  actualizarEmpleado: async (id, data) => {
    const response = await api.put(`/empleado/update/${id}/`, data);
    return response.data;
  },

  // CORRECCIÓN: Agregar 'delete/' antes del ID
  eliminarEmpleado: async (id) => {
    const response = await api.delete(`/empleado/delete/${id}/`);
    return response.data;
  },

  // Esta función requiere una vista especial o usar el update.
  // Como no vi una ruta específica 'toggle-activo' en tu urls.py de empleado,
  // asumiré que quieres hacer un PATCH al update normal.
  toggleActivo: async (id, activo) => {
    const response = await api.patch(`/empleado/update/${id}/`, { activo });
    return response.data;
  },
  
  // Agrego esta función porque vi que la tienes en urls.py
  getRoles: async () => {
    const response = await api.get('/empleado/roles/');
    return response.data;
  }
};