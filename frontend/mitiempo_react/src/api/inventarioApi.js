// src/api/inventarioApi.js
import api from "./axiosConfig";

export const getInsumos = () => api.get("/inventario/insumos/");
export const actualizarInsumo = (id, data) =>
  api.put(`/inventario/insumos/${id}/`, data);
