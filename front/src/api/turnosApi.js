// ========================================
// src/api/turnosApi.js
// ========================================
import api from './axiosConfig';

export const turnosApi = {
  getTurnos: async (params = {}) => {
    const response = await api.get('/turnos/', { params });
    return response.data;
  },

  getTurno: async (id) => {
    const response = await api.get(`/turnos/${id}/`);
    return response.data;
  },

  crearTurno: async (data) => {
    // data: { fecha, hora, cliente_id, servicios_ids, observaciones }
    const response = await api.post('/turnos/', data);
    return response.data;
  },

  actualizarTurno: async (id, data) => {
    const response = await api.put(`/turnos/${id}/`, data);
    return response.data;
  },

  cancelarTurno: async (id) => {
    const response = await api.patch(`/turnos/${id}/`, { estado: 'cancelado' });
    return response.data;
  },

  completarTurno: async (id) => {
    const response = await api.patch(`/turnos/${id}/`, { estado: 'completado' });
    return response.data;
  },

  confirmarTurno: async (id) => {
    const response = await api.patch(`/turnos/${id}/`, { estado: 'confirmado' });
    return response.data;
  },

  getHorariosDisponibles: async (fecha, serviciosIds = []) => {
    const params = { fecha };
    if (serviciosIds.length) {
      params.servicios_ids = serviciosIds.join(',');
    }
    const response = await api.get('/turnos/horarios-disponibles/', { params });
    return response.data;
  },

  getTurnosByFecha: async (fechaInicio, fechaFin) => {
    const response = await api.get('/turnos/', {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },
};
