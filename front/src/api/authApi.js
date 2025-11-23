//========================================
// src/api/authApi.js
// ========================================
import api, { setTokens, clearTokens } from './axiosConfig';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/login/', { email, password });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    return { user, access, refresh };
  },

  

  
  registerCliente: async (data) => {
    const response = await api.post('cliente/register/', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } finally {
      clearTokens();
    }
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  resetPassword: async (email) => {
    const response = await api.post('/auth/reset-password/', { email });
    return response.data;
  },

  confirmResetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password/confirm/', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};