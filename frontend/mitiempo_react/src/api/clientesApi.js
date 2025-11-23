// src/api/clientesApi.js
import api from "./axiosConfig";

// Admin crea cliente
export const crearClienteAdmin = (data) => {
  return api.post("/clientes/", data);
};

// obtener perfil cliente
export const getCliente = (id) => {
  return api.get(`/clientes/${id}/`);
};

// actualizar perfil
export const updateCliente = (id, data) => {
  return api.put(`/clientes/${id}/`, data);
};
