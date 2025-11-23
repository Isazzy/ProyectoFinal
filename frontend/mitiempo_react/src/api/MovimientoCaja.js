import api from './axiosConfig';

export const movimientosAPI = {
    getIngresos: async (cajaId = null) => {
        const params = cajaId ? { caja_id: cajaId } : {};
        const response = await api.get('/movimientos/ingresos/', { params });
        return response.data;
    },

    createIngreso: async (data) => {
        // data: { ingreso_descripcion, ingreso_monto }
        const response = await api.post('/movimientos/ingresos/', data);
        return response.data;
    },

    getEgresos: async (cajaId = null) => {
        const params = cajaId ? { caja_id: cajaId } : {};
        const response = await api.get('/movimientos/egresos/', { params });
        return response.data;
    },

    createEgreso: async (data) => {
        // data: { egreso_descripcion, egreso_monto }
        const response = await api.post('/movimientos/egresos/', data);
        return response.data;
    }
};