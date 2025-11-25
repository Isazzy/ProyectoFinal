// src/api/serviciosApi.js
import api from "./axiosConfig";

// listar servicios con filtros
export const getServicios = async (params = {}) => {
  const res = await api.get("/servicios/", { params });
  return res.data;
};

// detalle
export const getServicio = async (id) => {
  const res = await api.get(`/servicios/${id}/`);
  return res.data;
};

// crear
export const crearServicio = async (data) => {
  const res = await api.post("/servicios/", data);
  return res.data;
};

// actualizar
export const actualizarServicio = async (id, data) => {
  const res = await api.put(`/servicios/${id}/`, data);
  return res.data;
};

// activar/desactivar
export const toggleActivado = async (id, activado) => {
  return api.patch(`/servicios/${id}/activado/`, { activado });
};
