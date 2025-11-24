// ========================================
// src/api/authApi.js
// ========================================
import api, { setTokens, clearTokens } from './axiosConfig';

// CORRECCIÓN: Basado en tu listado de URLs del backend, 
// tus rutas de auth están dentro de 'empleado' y tienen un prefijo 'api'.
const AUTH_BASE = '/empleado/api'; 

export const authApi = {
  login: async (email, password) => {
    // URL Final: /api/empleado/api/login/
    const response = await api.post(`${AUTH_BASE}/login/`, { email, password });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    return { user, access, refresh };
  },

  registerCliente: async (data) => {
    // Este parece estar en otra app (Cliente), lo dejamos como estaba
    // URL Final: /api/cliente/register/
    const response = await api.post('/cliente/register/', data);
    return response.data;
  },

  logout: async () => {
    try {
      // Intentamos llamar al logout si existe en el backend, si no, solo limpiamos local
      // Ajustamos la ruta por si acaso existe en el backend bajo el mismo prefijo
      await api.post(`${AUTH_BASE}/logout/`);
    } catch (error) {
      console.log("Logout en servidor no requerido o falló", error);
    } finally {
      clearTokens();
    }
  },

  getProfile: async () => {
    // CORRECCIÓN DEL ERROR 404
    // URL Final: /api/empleado/api/auth/profile/
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