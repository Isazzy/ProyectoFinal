import api from './axiosConfig';

const MODULE_URL = '/turnos';

export const turnosApi = {
  getTurnos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/`, { params });
    return response.data;
  },

  getTurno: async (id) => {
    const response = await api.get(`${MODULE_URL}/${id}/`);
    return response.data;
  },

  crearTurno: async (data) => {
    const response = await api.post(`${MODULE_URL}/`, data);
    return response.data;
  },

  actualizarTurno: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/${id}/`, data);
    return response.data;
  },

  confirmarTurno: async (id) => {
    const response = await api.patch(`${MODULE_URL}/${id}/`, { estado: 'confirmado' });
    return response.data;
  },

  cancelarTurno: async (id) => {
    const response = await api.post(`${MODULE_URL}/${id}/solicitar_cancelacion/`);
    return response.data;
  },

  completarTurno: async (id) => {
    const response = await api.patch(`${MODULE_URL}/${id}/`, { estado: 'completado' });
    return response.data;
  },

  // CORRECCIÓN PRINCIPAL DEL ERROR: Manejo de tipos seguro
  getHorariosDisponibles: async (fecha, serviciosIds = []) => {
    const params = { fecha };
    
    if (Array.isArray(serviciosIds)) {
        // Si es array, lo unimos
        if (serviciosIds.length > 0) {
            params.servicios_ids = serviciosIds.join(',');
        }
    } else if (typeof serviciosIds === 'string' && serviciosIds) {
        // Si ya es string, lo usamos directo
        params.servicios_ids = serviciosIds;
    }

    // Asegúrate que esta URL coincida con tu urls.py del backend
    // Según tu view: 'horarios_disponibles'
    const response = await api.get(`${MODULE_URL}/disponibilidad/`, { params });
    return response.data;
  }
};