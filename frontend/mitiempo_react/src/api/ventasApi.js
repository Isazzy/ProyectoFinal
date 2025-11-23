// src/api/ventasApi.js
import api from "./axiosConfig";

export const crearVenta = (data) => api.post("/ventas/", data);
export const getVentas = (params = {}) => api.get("/ventas/", { params });
export const getVenta = (id) => api.get(`/ventas/${id}/`);
