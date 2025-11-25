<<<<<<< HEAD
// src/api/axiosConfig.jsx
import axios from "axios";

// ====== BASE URL ======
const BASE_API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.REACT_APP_API_URL) ||
  "http://127.0.0.1:8000/api";

// ====== AXIOS CLIENT ======
=======
// src/api/axiosConfig.js
import axios from "axios";

>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
const api = axios.create({
  baseURL: "http://localhost:8000/api", // cambiar cuando tengas dominio
});

<<<<<<< HEAD
// ====== REQUEST INTERCEPTOR ======
api.interceptors.request.use(
  (config) => {
    // Endpoints públicos de lectura (modificado: ahora false para que /servicios/ envíe token si existe)
    const isPublic = false;  // Cambiado a false para requerir auth en /servicios/

    // Bloque comentado para evitar eliminar Authorization
    /*
    if (isPublic) {
      if (config.headers) delete config.headers.Authorization;
      return config;
    }
    */

    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("access")
        : null;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ====== RESPONSE INTERCEPTOR (refresh) ======
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const refreshToken =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("refresh")
          : null;

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccess = res.data?.access;
          if (newAccess && typeof localStorage !== "undefined") {
            localStorage.setItem("access", newAccess);
          }

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          if (typeof localStorage !== "undefined") localStorage.clear();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else {
        if (typeof localStorage !== "undefined") localStorage.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ====== HELPERS DE NORMALIZACIÓN ======
// Devuelve r.data
const pickData = (p) => p.then((r) => r.data);
// Devuelve siempre un array (soporta [] | {results:[]} | {data:[]})
const asList = (data) =>
  (Array.isArray(data) ? data : (data?.results ?? data?.data ?? [])) || [];
// Devuelve un objeto (o null) (soporta { ... } | {data:{...}})
const asItem = (data) =>
  data && !Array.isArray(data) ? (data?.data ?? data) : null;

// =====================
// SERVICES
// =====================

// ---- Auth ----
export const authService = {
  // Devuelve { access, refresh, user } y guarda tokens
  login: async (usernameOrEmail, password) => {
    const payload = { password };
    if (typeof usernameOrEmail === "string" && usernameOrEmail.includes("@")) {
      payload.email = usernameOrEmail;
    } else {
      payload.username = usernameOrEmail;
    }
    const res = await api.post("/login/", payload);

    const { access, refresh, user } = res.data || {};
    if (typeof localStorage !== "undefined") {
      if (access) localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);
    }
    return { access, refresh, user };
  },

  logout: async () => {
    try {
      await api.post("/logout/");
    } catch {
      // si no existe endpoint, ignoramos
    }
  },
};

// ---- Compras ----
export const compraService = {
  // listas paginadas o no → siempre []
  listar: async (params) =>
    asList(await pickData(api.get("/compras/", { params }))),

  // create/update/delete → devolvemos data tal cual
  crear: (payload) => pickData(api.post("/compras/", payload)),
  detalle: async (id) => asItem(await pickData(api.get(`/compras/${id}/`))),
  actualizar: (id, payload) => pickData(api.put(`/compras/${id}/`, payload)),
  eliminar: (id) => pickData(api.delete(`/compras/${id}/`)),

  // acciones custom
  completar: (id) => pickData(api.post(`/compras/${id}/completar/`)),
  cancelar: (id) => pickData(api.post(`/compras/${id}/cancelar/`)),
};

// Aliases que usa tu UI (compat)
if (!compraService.getAll)  compraService.getAll  = (params)  => compraService.listar(params);
if (!compraService.create)  compraService.create  = (payload) => compraService.crear(payload);
if (!compraService.delete)  compraService.delete  = (id)      => compraService.eliminar(id);

// limpio params para no enviar '' o null
const cleanParams = (params = {}) => {
  const out = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s === '') return;
    out[k] = s;
  });
  return out;
};

// ---- Proveedores ----
export const proveedorService = {
  listar: async (params) =>
    asList(await pickData(api.get("/proveedores/", { params: cleanParams(params) }))),

  crear: (payload) => pickData(api.post("/proveedores/", payload)),
  detalle: async (id) => asItem(await pickData(api.get(`/proveedores/${id}/`))),
  actualizar: (id, p) => pickData(api.put(`/proveedores/${id}/`, p)),
  eliminar: (id) => pickData(api.delete(`/proveedores/${id}/`)),
};

// Proveedores activos (compat con tu CompraForm)
if (!proveedorService.getActivos) {
  proveedorService.getActivos = async () =>
    asList(await pickData(api.get("/proveedores/", { params: { activo: true } })));
}

// --- extras proveedor (ADD-ONLY) ---
proveedorService.productos = async (id) =>
  asList(await pickData(api.get(`/proveedores/${id}/productos/`)));

proveedorService.historial = async (id) =>
  asList(await pickData(api.get(`/proveedores/${id}/historial_compras/`)));

// (Opcional) listar relaciones producto-proveedor por proveedor
export const productoProveedorService = {
  listar: async (params) =>
    asList(await pickData(api.get('/productos-proveedores/', { params }))),
};

// ---- Servicios ----
export const servicioService = {
  listar: async (params) => asList(await pickData(api.get("/servicios/", { params: cleanParams(params) }))),
  crear: (payload) => pickData(api.post("/servicios/", payload)),
  detalle: async (id) => asItem(await pickData(api.get(`/servicios/${id}/`))),
  actualizar: (id, payload) => pickData(api.put(`/servicios/${id}/`, payload)),
  eliminar: (id) => pickData(api.delete(`/servicios/${id}/`)),
};

// ====== DEFAULT EXPORT (para import api from ...) ======
export default api;
=======
// interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
