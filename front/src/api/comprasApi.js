// ========================================
// src/api/comprasApi.js
// ========================================
import api from '../api/axiosConfig'; // Asumiendo que axiosConfig está un nivel arriba

const MODULE_URL = '/compras'; 

export const comprasApi = {
    // --- PROVEEDORES CRUD ---
    getProveedores: async (params = {}) => {
        const response = await api.get(`${MODULE_URL}/proveedores/`, { params });
        return response.data;
    },
    crearProveedor: async (data) => {
        const response = await api.post(`${MODULE_URL}/proveedores/`, data);
        return response.data;
    },
    actualizarProveedor: async (id, data) => {
        const response = await api.put(`${MODULE_URL}/proveedores/${id}/`, data);
        return response.data;
    },
    eliminarProveedor: async (id) => {
        const response = await api.delete(`${MODULE_URL}/proveedores/${id}/`);
        return response.data;
    },

    // --- COMPRAS (Listar/Crear/Ver) ---
    getCompras: async (params = {}) => {
        const response = await api.get(`${MODULE_URL}/compras/`, { params });
        return response.data;
    },
    getCompraDetail: async (id) => {
        const response = await api.get(`${MODULE_URL}/compras/${id}/`);
        return response.data;
    },
    crearCompra: async (data) => {
        // La data debe incluir { proveedor, compra_metodo_pago, detalles }
        const response = await api.post(`${MODULE_URL}/compras/`, data);
        return response.data;
    }
};