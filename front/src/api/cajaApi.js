import api from './axiosConfig';

const MODULE_URL = '/caja'; 

export const cajaApi = {
  // Verificar si hay caja abierta
  // URL: /api/caja/estado/
  getStatus: async () => {
    const response = await api.get(`${MODULE_URL}/estado/`);
    return response.data;
  },

  // Abrir una nueva caja
  // URL: /api/caja/abrir/
  abrirCaja: async (montoInicial) => {
    const response = await api.post(`${MODULE_URL}/abrir/`, { 
        caja_monto_inicial: montoInicial 
    });
    return response.data;
  },

  // Cerrar la caja actual
  // URL: /api/caja/cerrar/
  // Nota: No enviamos ID en la URL porque tu vista 'CerrarCajaView' 
  // usa get_object() para encontrar la caja activa automáticamente.
  cerrarCaja: async (id, observacion) => {
    const response = await api.put(`${MODULE_URL}/cerrar/`, { 
        caja_observacion: observacion 
    });
    return response.data;
  },

  // Obtener movimientos
  // URL: /api/movimiento-caja/?caja_id=...
  getMovimientos: async (cajaId) => {
    // Ajustado a la URL raíz que proveíste
    const response = await api.get(`/movimiento-caja/`, { 
        params: { caja_id: cajaId } 
    });
    return response.data;
  },
  
  // Historial de cajas cerradas
  // URL: /api/caja/historial/
  getHistorial: async () => {
    const response = await api.get(`${MODULE_URL}/historial/`);
    return response.data;
  }
};