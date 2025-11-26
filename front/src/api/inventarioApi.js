import api from './axiosConfig';

const MODULE_URL = '/inventario'; 

export const inventarioApi = {
  // --- INSUMOS ---
  getInsumos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/insumos/`, { params });
    return response.data;
  },
  getInsumosParaSelect: async (params = {}) => {
     // Helper para cargar listas sin paginación excesiva
     const response = await api.get(`${MODULE_URL}/insumos/`, { params: { ...params, page_size: 1000 } });
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
    const response = await api.patch(`${MODULE_URL}/insumos/${id}/`, data);
    return response.data;
  },
  eliminarInsumo: async (id) => {
    const response = await api.delete(`${MODULE_URL}/insumos/${id}/`);
    return response.data;
  },
  
  // --- PRODUCTOS ---
  getProductos: async (params = {}) => {
    const response = await api.get(`${MODULE_URL}/productos/`, { params });
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

  // --- DEPENDENCIAS / CONFIGURACIÓN ---

  // 1. Tipos de Producto
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

  // 2. Marcas
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

  // 3. Categorías de Insumo (NUEVO)
  getCategorias: async () => {
    const response = await api.get(`${MODULE_URL}/categorias-insumo/`);
    return response.data; 
  },
  crearCategoria: async (data) => {
    const response = await api.post(`${MODULE_URL}/categorias-insumo/`, data);
    return response.data;
  },
  actualizarCategoria: async (id, data) => {
    const response = await api.put(`${MODULE_URL}/categorias-insumo/${id}/`, data);
    return response.data;
  },
  eliminarCategoria: async (id) => {
    const response = await api.delete(`${MODULE_URL}/categorias-insumo/${id}/`);
    return response.data;
  },
  
  // Movimiento Stock (Insumos)
  actualizarStock: async (id, cantidad, tipo = 'ingreso') => {
    const response = await api.post(`${MODULE_URL}/insumos/${id}/movimiento/`, {
      cantidad, tipo
    });
    return response.data;
  },
};