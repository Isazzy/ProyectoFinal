import api from './axiosConfig';

const MODULE_URL = '/empleado'; 

export const empleadosApi = {
  // GET Lista de empleados
  getEmpleados: async () => {
    const response = await api.get(`${MODULE_URL}/list/`);
    return response.data;
  },

  // GET Roles (Grupos)
  getRoles: async () => {
    const response = await api.get(`${MODULE_URL}/roles/`);
    return response.data;
  },

  // POST Crear
  crearEmpleado: async (data) => {
    // El backend espera { username, password, email, rol (id), ... }
    const response = await api.post(`${MODULE_URL}/create/`, data);
    return response.data;
  },

  // PUT/PATCH Actualizar
  actualizarEmpleado: async (id, data) => {
    const response = await api.patch(`${MODULE_URL}/update/${id}/`, data);
    return response.data;
  },

  // DELETE Eliminar
  eliminarEmpleado: async (id) => {
    const response = await api.delete(`${MODULE_URL}/delete/${id}/`);
    return response.data;
  }
};