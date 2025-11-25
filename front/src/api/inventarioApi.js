// ========================================
// src/api/inventarioApi.js
// ========================================
import api from './axiosConfig';

// Ruta base del módulo inventario
const MODULE_URL = '/inventario'; 

export const inventarioApi = {
  
  // ==============================================================
  // SECCIÓN 1: INSUMOS (Stock, Movimientos)
  // ==============================================================
  
  getInsumos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/insumos/`, { params });
    return response.data;
  },

  getInsumo: async (id) => {
    const response = await api.get(`${MODULE_URL}/insumos/${id}/`);
    return response.data;
  },

  crearInsumo: async (data) => {
    const response = await api.post(`${MODULE_URL}/insumos/`, data);
    return response.data;
  },

  actualizarInsumo: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/insumos/${id}/`, data);
    return response.data;
  },


  patchInsumo: async (id, data) => {
    // Nota el método .patch() en lugar de .put()
    const response = await api.patch(`${MODULE_URL}/insumos/${id}/`, data);
    return response.data;
  },

  eliminarInsumo: async (id) => {
    const response = await api.delete(`${MODULE_URL}/insumos/${id}/`);
    return response.data;
  },

  // --- Movimientos de Stock ---
  
  actualizarStock: async (id, cantidad, tipo = 'ingreso') => {
    const response = await api.post(`${MODULE_URL}/insumos/${id}/movimiento/`, {
      cantidad,
      tipo, // 'ingreso' | 'egreso'
    });
    return response.data;
  },

  // OBS: Asegúrate de crear la ruta 'movimientos/' en Django si planeas usar historial
  getMovimientos: async (insumoId, params = {}) => {
    const response = await api.get(`${MODULE_URL}/insumos/${insumoId}/movimientos/`, { params });
    return response.data;
  },

  getInsumosStockBajo: async () => {
    const response = await api.get(`${MODULE_URL}/insumos/`, { params: { stock_bajo: true } });
    return response.data;
  },

  // Helper para llenar selects (sin paginación o paginación amplia)
  getInsumosParaSelect: async () => {
    const response = await api.get(`${MODULE_URL}/insumos/`, { params: { page_size: 100 } });
    return response.data.results || response.data;
  },


  // ==============================================================
  // SECCIÓN 2: PRODUCTOS (Venta)
  // ==============================================================

  getProductos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/productos/`, { params });
    return response.data;
  },

  getProducto: async (id) => {
    const response = await api.get(`${MODULE_URL}/productos/${id}/`);
    return response.data;
  },

  crearProducto: async (data) => {
    const response = await api.post(`${MODULE_URL}/productos/`, data);
    return response.data;
  },

  actualizarProducto: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/productos/${id}/`, data);
    return response.data;
  },

  patchProducto: async (id, data) => {
    const response = await api.patch(`${MODULE_URL}/productos/${id}/`, data);
    return response.data;
  },

  eliminarProducto: async (id) => {
    const response = await api.delete(`${MODULE_URL}/productos/${id}/`);
    return response.data;
  },


  // ==============================================================
  // SECCIÓN 3: CONFIGURACIÓN (Tipos, Marcas, Categorías)
  // ==============================================================

  // --- Tipos de Producto ---
  getTiposProducto: async () => {
    const response = await api.get(`${MODULE_URL}/tipos-producto/`);
    return response.data;
  },
  crearTipoProducto: async (data) => {
    const response = await api.post(`${MODULE_URL}/tipos-producto/`, data);
    return response.data;
  },
  actualizarTipoProducto: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/tipos-producto/${id}/`, data);
    return response.data;
  },
  eliminarTipoProducto: async (id) => {
    const response = await api.delete(`${MODULE_URL}/tipos-producto/${id}/`);
    return response.data;
  },

  // --- Marcas ---
  getMarcas: async () => {
    const response = await api.get(`${MODULE_URL}/marcas/`); 
    return response.data;
  },
  crearMarca: async (data) => {
    const response = await api.post(`${MODULE_URL}/marcas/`, data);
    return response.data;
  },
  actualizarMarca: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/marcas/${id}/`, data);
    return response.data;
  },
  eliminarMarca: async (id) => {
    const response = await api.delete(`${MODULE_URL}/marcas/${id}/`);
    return response.data;
  },

  // --- Categorías de Insumo ---
  getCategorias: async () => {
    const response = await api.get(`${MODULE_URL}/categorias-insumo/`);
    return response.data; 
  },
  // Si necesitas CRUD de categorías, agrégalo aquí siguiendo el patrón anterior.
};