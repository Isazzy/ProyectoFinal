// src/api/turnosApi.js
import api from "./axiosConfig";

export const getTurnos = async (params = {}) => {
  const res = await api.get("/turnos/", { params });
  return res.data;
};

export const crearTurno = async (data) => {
  const res = await api.post("/turnos/", data);
  return res.data;
};

export const cancelarTurno = async (id) => {
  return api.patch(`/turnos/${id}/cancelar/`);
};

export const completarTurno = async (id) => {
  return api.patch(`/turnos/${id}/completar/`);
};
