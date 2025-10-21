// front/src/api/Usuarios.js
import api from "./axiosConfig";

const ENDPOINT = "/usuarios/";

export const getUsuarios = (id = null) =>
  id ? api.get(`${ENDPOINT}${id}/`) : api.get(ENDPOINT);

export const createUsuario = (usuario) => api.post(ENDPOINT, usuario);

export const updateUsuario = (id, usuario) =>
  api.put(`${ENDPOINT}${id}/`, usuario);

export const deleteUsuario = (id) => api.delete(`${ENDPOINT}${id}/`);

// Obtener empleados para seleccionar profesional al sacar turno
export const getEmpleados = () => api.get(`${ENDPOINT}empleados/`);

export default {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getEmpleados,
};
