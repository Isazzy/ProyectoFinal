// ========================================
// src/api/authApi.js
// ========================================
import api, { setTokens, clearTokens } from './axiosConfig';

// Nota: Ajustamos la base según tus rutas reales del backend
const AUTH_BASE = '/empleado/api'; 

export const authApi = {
  login: async (email, password) => {
    const response = await api.post(`${AUTH_BASE}/login/`, { email, password });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    return { user, access, refresh };
  },

  registerCliente: async (data) => {
    // Asumiendo que esta ruta es correcta según tu backend
    const response = await api.post('/cliente/register/', data);
    return response.data;
  },

  logout: async () => {
    try {
      // Intentamos notificar al backend (opcional)
      // Usamos una ruta relativa por si acaso
      await api.post(`${AUTH_BASE}/logout/`);
    } catch (error) {
      // Si da 404 o 500, lo ignoramos intencionalmente
      // porque lo importante es borrar el token local.
      console.warn("Logout en servidor no disponible o falló, limpiando sesión local.");
    } finally {
      // SIEMPRE borramos los tokens locales
      clearTokens();
    }
  },

  getProfile: async () => {
    const response = await api.get(`${AUTH_BASE}/auth/profile/`);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch(`${AUTH_BASE}/auth/profile/`, data);
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await api.post(`${AUTH_BASE}/reset-password/`, { email });
    return response.data;
  },

  confirmResetPassword: async (token, newPassword) => {
    const response = await api.post(`${AUTH_BASE}/reset-password/confirm/`, {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};