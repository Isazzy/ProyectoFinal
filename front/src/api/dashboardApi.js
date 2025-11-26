import api from './axiosConfig';

export const dashboardApi = {
  // Obtener alertas de stock bajo (Insumos y Productos unificados)
  // Endpoint: /api/inventario/alertas/
  getAlertasStock: async () => {
    const response = await api.get('/inventario/alertas/');
    return response.data;
  },

  // Obtener KPIs financieros y rankings (Ventas hoy, mes, ticket promedio, top servicios/productos)
  // Endpoint: /api/ventas/dashboard/kpis/
  getKPIs: async () => {
    const response = await api.get('/ventas/dashboard/kpis/');
    return response.data;
  }
};