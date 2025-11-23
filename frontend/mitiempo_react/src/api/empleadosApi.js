// src/api/empleadosApi.js
import api from "./axiosConfig";

export const getEmpleados = () => api.get("/empleados/");
export const crearEmpleado = (data) => api.post("/empleados/", data);
export const updateEmpleado = (id, data) => api.put(`/empleados/${id}/`, data);
