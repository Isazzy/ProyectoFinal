// ========================================
// src/api/dashboardApi.js
// API para Dashboard con Ingresos/Egresos
// ========================================
import api from './axiosConfig';

export const dashboardApi = {
  // Obtener alertas de stock bajo (Insumos y Productos unificados)
  // Endpoint: /api/inventario/alertas/
  getAlertasStock: async () => {
    const response = await api.get('/inventario/alertas/');
    return response.data;
  },

  // Obtener KPIs financieros y rankings
  // Endpoint: /api/ventas/dashboard/kpis/
  getKPIs: async () => {
    const response = await api.get('/ventas/dashboard/kpis/');
    return response.data;
  },

  // NUEVO: Obtener datos de Ingresos vs Egresos
  // Endpoint: /api/ventas/stats/ingresos-egresos/
  getIngresosEgresos: async (dias = 30) => {
    const response = await api.get('/ventas/stats/ingresos-egresos/', {
      params: { dias }
    });
    return response.data;
  }
};