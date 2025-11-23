import api from './axiosConfig';

export const comprasAPI = {
    getProveedores: async () => {
        const response = await api.get('/proveedores/');
        return response.data;
    },

    createProveedor: async (data) => {
        const response = await api.post('/proveedores/', data);
        return response.data;
    },

    /**
     * Registra una compra completa
     * @param {Object} data 
     * Estructura: { 
     * proveedor: id, 
     * metodo_pago: 'efectivo' | 'transferencia', 
     * detalles: [{ producto: id, cantidad: 10, precio_unitario: 500 }] 
     * }
     */
    createCompra: async (data) => {
        const response = await api.post('/compras/', data);
        return response.data;
    },
    
    getHistorialCompras: async () => {
        const response = await api.get('/compras/');
        return response.data;
    }
};