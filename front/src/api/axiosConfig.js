// ========================================
// MI TIEMPO - Axios Configuration
// ========================================

import axios from 'axios';

// Base URL from environment
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token helpers
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setTokens = (access, refresh) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          setTokens(access, refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message 
      || error.response?.data?.detail 
      || error.message 
      || 'Ha ocurrido un error';

    // Create enhanced error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(enhancedError);
  }
);

// API Helper functions
export const apiHelpers = {
  // GET request
  get: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // POST request
  post: async (url, data = {}) => {
    const response = await api.post(url, data);
    return response.data;
  },

  // PUT request
  put: async (url, data = {}) => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async (url, data = {}) => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async (url) => {
    const response = await api.delete(url);
    return response.data;
  },

  // Upload file
  upload: async (url, formData) => {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;