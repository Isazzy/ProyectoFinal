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

  crearTurno: async ({ fecha, hora, cliente_id, servicios_ids, observaciones }) => {
    // CORRECCIÓN: Combinar fecha y hora en ISO String para Django
    // fecha: "2023-10-25", hora: "09:30" -> "2023-10-25T09:30:00"
    const fechaHoraInicio = `${fecha}T${hora}:00`;

    const payload = {
      fecha_hora_inicio: fechaHoraInicio,
      cliente: cliente_id,      // Backend espera ID
      servicios: servicios_ids, // Backend espera 'servicios' (lista de ints)
      observaciones
    };

    const response = await api.post('/turnos/', payload);
    return response.data;
  },

  actualizarTurno: async (id, data) => {
    const response = await api.put(`/turnos/${id}/`, data);
    return response.data;
  },

  confirmarTurno: async (id) => {
    const response = await api.patch(`/turnos/${id}/`, { estado: 'confirmado' });
    return response.data;
  },

  // CORRECCIÓN: Usar acciones personalizadas si existen en viewset, 
  // o PATCH parcial si es REST estándar.
  cancelarTurno: async (id) => {
    // Si usas la @action definida en viewset: /turnos/{id}/solicitar_cancelacion/
    const response = await api.post(`/turnos/${id}/solicitar_cancelacion/`);
    return response.data;
  },

  completarTurno: async (id) => {
    const response = await api.patch(`/turnos/${id}/`, { estado: 'completado' });
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
};