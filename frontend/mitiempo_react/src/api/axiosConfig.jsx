import axios from "axios";

// 💡 Tu URL base ya incluye /api, ¡perfecto!
const BASE_API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    // 💡 Asegura que los endpoints de lectura pública no necesiten token
    const isPublic =
      config.method === "get" &&
      (config.url.startsWith("/servicios") || 
       // --- CORRECCIÓN AQUÍ ---
       // Tu service llama a "/horarios_disponibles/", no "/turnos/horarios_disponibles/"
       config.url.startsWith("/horarios_disponibles"));

    if (isPublic) {
      delete config.headers.Authorization;
      return config;
    }

    // Usamos 'access' como lo definiste
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

    // 401 y no es un reintento
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh"); // Usamos 'refresh'

      if (refreshToken) {
        try {
          // Llamada directa a axios, NO a 'api' para evitar bucle de interceptor
          const res = await axios.post(`${BASE_API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess); // Guardamos el nuevo 'access'

          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest); // Reintentamos la llamada original con la instancia 'api'
        } catch {
          // Si el refresh token falla (expiró, etc.)
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        // No hay refresh token
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;