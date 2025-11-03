import api from "./axiosConfig";

// --- PRODUCTOS ---
export const getProductos = (params = {}) =>
  api.get("/productos/", { params });

export const getProductoById = (id) =>
  api.get(`/productos/${id}/`);

export const createProducto = (data) =>
  api.post("/productos/", data);

export const updateProducto = (id, data) =>
  api.patch(`/productos/${id}/`, data);

export const deleteProducto = (id) =>
  api.delete(`/productos/${id}/`);

export const getProductosBajoStock = (params = {}) =>
  api.get("/productos/", { params: { ...params, bajo_stock: "1" } });

// --- HISTORIAL DE STOCK ---

// *** NUEVA FUNCIÓN (Para el historial general) ***
export const getStockHistory = (params = {}) =>
  api.get("/stockhistory/", { params });

// (Esta es la que ya usas para el modal de un producto)
export const getStockHistoryByProducto = (productoId, params = {}) =>
  api.get("/stockhistory/", { params: { ...params, producto: productoId } });

export const createStockMovement = (data) =>
  api.post("/stockhistory/", data);

// --- MARCAS Y CATEGORIAS ---
export const getMarcas = () => api.get("/marcas/");
export const createMarca = (data) => api.post("/marcas/", data);
export const getCategorias = () => api.get("/categorias/");
export const createCategoria = (data) => api.post("/categorias/", data);