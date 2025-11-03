import api from "./axiosConfig";

const ENDPOINT = "/turnos/"; 

export const getTurnos = (params = {}) =>

  api.get(ENDPOINT, { params }); 

export const getTurnoById = (id) => api.get(`${ENDPOINT}${id}/`);

export const createTurno = (turno) => api.post(ENDPOINT, turno);

export const updateTurno = (id, turno) => api.patch(`${ENDPOINT}${id}/`, turno);

export const deleteTurno = (id) => api.delete(`${ENDPOINT}${id}/`);

// La URL está alineada con el interceptor corregido
export const getHorariosDisponibles = ( fecha,  servicios_ids,  ) =>
  api.get(`/horarios_disponibles/`, { 
      params: { 
          fecha, 
          servicios_ids: Array.isArray(servicios_ids) ? servicios_ids.join(',') : servicios_ids
      } 
  });