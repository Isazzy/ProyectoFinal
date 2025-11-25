import api from './axiosConfig'; // Asumo que tienes configurado axios aquí

const endpoint = '/cajas';

export const cajaAPI = {
    /**
     * Obtiene el estado actual de la caja.
     * Si hay una abierta, devuelve sus datos.
     * Si no, devuelve caja_estado: false y el monto sugerido.
     */
    getStatus: async () => {
        const response = await api.get(`${endpoint}/estado/`);
        return response.data;
    },

    /**
     * Abre una nueva caja.
     * @param {Object} data - { caja_monto_inicial: number (opcional) }
     */
    abrirCaja: async (data) => {
        const response = await api.post(`${endpoint}/abrir/`, data);
        return response.data;
    },

    /**
     * Cierra la caja actual.
     * @param {Object} data - { caja_observacion: string }
     */
    cerrarCaja: async (data) => {
        const response = await api.put(`${endpoint}/cerrar/`, data);
        return response.data;
    },

    /**
     * Obtiene el historial de cajas cerradas.
     */
    getHistorial: async () => {
        const response = await api.get(`${endpoint}/historial/`);
        return response.data;
    },
};