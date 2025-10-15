// front/src/api/servicios.js
import api from "./axiosConfig";

export const getServicios = () => api.get("/servicios/");

export const getServicioById = (id) => api.get(`/servicios/${id}/`);

export const createServicio = (data) => api.post("/servicios/", data);

export const updateServicio = (id, data) => api.put(`/servicios/${id}/`, data);

export const deleteServicio = (id) => api.delete(`/servicios/${id}/`);
