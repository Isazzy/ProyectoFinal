import api from './axiosConfig';

export const statsApi = {
  // Obtener datos para el gráfico de ingresos (Servicios vs Productos)
  // Endpoint: /api/ventas/stats/ingresos/?dias=90
  getIngresosChart: async (dias = 90) => {
    try {
      const response = await api.get(`/ventas/stats/ingresos/`, { 
        params: { dias } 
      });
      return response.data;
    } catch (error) {
      console.error("Error en statsApi:", error);
      throw error;
    }
  }
};