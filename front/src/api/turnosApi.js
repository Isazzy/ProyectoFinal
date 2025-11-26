// src/api/turnosApi.js
import api from './axiosConfig';

const MODULE_URL = '/turnos';

export const turnosApi = {

  // ==========================================
  // LISTAR
  // ==========================================
  getTurnos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/`, { params });
    return response.data;
  },

  // Traer solo turnos con comprobante pendiente
  getTurnosPendientesPago: async () => {
    const response = await api.get(`${MODULE_URL}/`, {
      params: { pendiente_pago: 1 }
    });
    return response.data;
  },

  // ==========================================
  // DETALLE
  // ==========================================
  getTurno: async (id) => {
    const response = await api.get(`${MODULE_URL}/${id}/`);
    return response.data;
  },

  // ==========================================
  // CREAR
  // ==========================================
  crearTurno: async (data) => {
    const response = await api.post(`${MODULE_URL}/`, data);
    return response.data;
  },

  // ==========================================
  // EDITAR
  // ==========================================
  actualizarTurno: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/${id}/`, data);
    return response.data;
  },

  // ==========================================
  // CONFIRMAR
  // ==========================================
  confirmarTurno: async (id) => {
    const response = await api.patch(`${MODULE_URL}/${id}/`, { estado: 'confirmado' });
    return response.data;
  },

  // ==========================================
  // CANCELAR
  // ==========================================
  cancelarTurno: async (id) => {
    const response = await api.post(`${MODULE_URL}/${id}/solicitar_cancelacion/`);
    return response.data;
  },

  // ==========================================
  // COMPLETAR
  // ==========================================
  completarTurno: async (id) => {
    const response = await api.patch(`${MODULE_URL}/${id}/`, { estado: 'completado' });
    return response.data;
  },

  // ==========================================
  // HORARIOS DISPONIBLES
  // ==========================================
  getHorariosDisponibles: async (fecha, serviciosIds = []) => {
    const params = { fecha };

    if (Array.isArray(serviciosIds)) {
      if (serviciosIds.length > 0) {
        params.servicios_ids = serviciosIds.join(',');
      }
    } else if (typeof serviciosIds === 'string' && serviciosIds) {
      params.servicios_ids = serviciosIds;
    }

    const response = await api.get(`${MODULE_URL}/disponibilidad/`, { params });
    return response.data;
  },

  // =====================================================
  // SUBIR COMPROBANTE
  // =====================================================
  subirComprobante: async (id, archivo, estadoPago = "seña") => {
    const formData = new FormData();
    formData.append("comprobante", archivo);
    formData.append("estado_pago", estadoPago);

    const token = localStorage.getItem("access");

    return api.post(
      `${MODULE_URL}/${id}/subir_comprobante/`,
      formData,
      {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "multipart/form-data"
        }
      }
    );
},


  // =====================================================
  // ACEPTAR PAGO (ADMIN)
  // =====================================================
  aceptarPago: async (id) => {
    const response = await api.post(`${MODULE_URL}/${id}/aceptar_pago/`);
    return response.data;
  },

  // =====================================================
  // RECHAZAR PAGO (ADMIN)
  // =====================================================
  rechazarPago: async (id) => {
    const response = await api.post(`${MODULE_URL}/${id}/rechazar_pago/`);
    return response.data;
  },

};
