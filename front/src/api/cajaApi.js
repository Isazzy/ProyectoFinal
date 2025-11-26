// ========================================
// src/api/cajaApi.js
// ========================================
import api from './axiosConfig';

const MODULE_URL = '/caja'; 
const MOVIMIENTOS_URL = '/movimiento-caja'; // Nueva base para movimientos

export const cajaApi = {
  // --- GESTIÓN DE CAJA ---
  
  // Verificar si hay caja abierta
  getStatus: async () => {
    const response = await api.get(`${MODULE_URL}/estado/`);
    return response.data;
  },

  // Abrir una nueva caja
  abrirCaja: async (montoInicial) => {
    const response = await api.post(`${MODULE_URL}/abrir/`, { 
        caja_monto_inicial: montoInicial 
    });
    return response.data;
  },

  // Cerrar la caja actual
  cerrarCaja: async (id, observacion) => {
    const response = await api.put(`${MODULE_URL}/cerrar/`, { 
        caja_observacion: observacion 
    });
    return response.data;
  },

  // Historial de cajas cerradas
  getHistorial: async () => {
    const response = await api.get(`${MODULE_URL}/historial/`);
    return response.data;
  },

  // --- MOVIMIENTOS (Ingresos / Egresos) ---

  // Obtener lista consolidada
  getMovimientos: async (cajaId) => {
    const response = await api.get(`${MOVIMIENTOS_URL}/`, { 
        params: { caja_id: cajaId } 
    });
    return response.data; 
  },

  // Crear Ingreso Manual (FALTABA ESTO)
  crearIngreso: async (data) => {
      // data: { ingreso_descripcion, ingreso_monto }
      const response = await api.post(`${MOVIMIENTOS_URL}/ingresos/`, data);
      return response.data;
  },

  // Crear Egreso Manual (FALTABA ESTO)
  crearEgreso: async (data) => {
      // data: { egreso_descripcion, egreso_monto }
      const response = await api.post(`${MOVIMIENTOS_URL}/egresos/`, data);
      return response.data;
  }
};