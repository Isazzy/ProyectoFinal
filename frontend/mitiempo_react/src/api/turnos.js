import api from "./axiosConfig";

const ENDPOINT = "/turnos/"; 

export const getTurnos = (id = null) =>
  id ? api.get(`${ENDPOINT}${id}/`) : api.get(ENDPOINT);

export const createTurno = (turno) => api.post(ENDPOINT, turno);

export const updateTurno = (id, turno) => api.put(`${ENDPOINT}${id}/`, turno);

export const deleteTurno = (id) => api.delete(`${ENDPOINT}${id}/`);

export const getHorariosDisponibles = (id_prof, fecha, servicios_ids) =>
  // Envía servicios_ids como una cadena de texto separada por comas ("1,2,3")
  api.get(`/horarios_disponibles/`, { 
      params: { 
          id_prof: id_prof || '', // Puede ser opcional/vacío
          fecha, 
          servicios_ids: Array.isArray(servicios_ids) ? servicios_ids.join(',') : servicios_ids
      } 
  });

export default {
  getTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
  getHorariosDisponibles,
};