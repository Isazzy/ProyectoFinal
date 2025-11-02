// ejemplo: src/api/productService.js
import api from "./axiosConfig";

export const getProductos = () => api.get("/productos/");
export const createProducto = (data) => api.post("/productos/", data);
export const updateProducto = (id, data) => api.put(`/productos/${id}/`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}/`);
