// front/src/api/turnos.js
import api from "./axiosConfig";

const ENDPOINT = "/turnos/";

export const getTurnos = (id = null) =>
  id ? api.get(`${ENDPOINT}${id}/`) : api.get(ENDPOINT);

export const createTurno = (turno) => api.post(ENDPOINT, turno);

export const updateTurno = (id, turno) => api.put(`${ENDPOINT}${id}/`, turno);

export const deleteTurno = (id) => api.delete(`${ENDPOINT}${id}/`);

export const getHorariosDisponibles = (id_prof, fecha) =>
  api.get(`/turnos/horarios_disponibles/`, { params: { id_prof, fecha } });

export default {
  getTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
  getHorariosDisponibles,
};
