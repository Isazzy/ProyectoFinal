import axios from "axios";

// 💡 Tu URL base ya incluye /api, ¡perfecto!
const BASE_API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    // ✅ Solo los endpoints realmente públicos (sin autenticación)
    const isPublic =
      config.method === "get" &&
      config.url.startsWith("/servicios"); // 👈 quitamos horarios_disponibles

    if (isPublic) {
      delete config.headers.Authorization;
      return config;
    }

    // 🔐 Para todos los demás, agrega el token si existe
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔄 Si da 401 (token expirado) y no es un reintento, intenta refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);

          // 🔁 Reintenta con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
