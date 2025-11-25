import api from "./axiosConfig";

const ENDPOINT = "/turnos/"; 

export const getTurnos = (params = {}) =>
<<<<<<< HEAD

  api.get(ENDPOINT, { params }); 
=======
  api.get(ENDPOINT, { params });
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be

export const getTurnoById = (id) => api.get(`${ENDPOINT}${id}/`);

export const createTurno = (turno) => api.post(ENDPOINT, turno);

export const updateTurno = (id, turno) => api.patch(`${ENDPOINT}${id}/`, turno);

export const deleteTurno = (id) => api.delete(`${ENDPOINT}${id}/`);

<<<<<<< HEAD
// La URL está alineada con el interceptor corregido
export const getHorariosDisponibles = ( fecha,  servicios_ids,  ) =>
=======
export const getHorariosDisponibles = (fecha, servicios_ids) =>
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  api.get(`/horarios_disponibles/`, { 
      params: { 
          fecha, 
          servicios_ids: Array.isArray(servicios_ids) ? servicios_ids.join(',') : servicios_ids
      } 
<<<<<<< HEAD
  });
=======
  });

// --- Nueva función para solicitar cancelación ---
export const solicitarCancelacionTurno = (id_turno) =>
  api.post(`${ENDPOINT}${id_turno}/solicitar_cancelacion/`);
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
