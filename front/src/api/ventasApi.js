// ========================================
// src/api/ventasApi.js
// ========================================
import api from './axiosConfig';

// Base del módulo (coincide con 'api/ventas/' en urls.py principal)
const MODULE_URL = '/ventas'; 

export const ventasApi = {
  
  getVentas: async (params = {}) => {
    // Genera: /api/ventas/ventas/?fecha=...
    const response = await api.get(`${MODULE_URL}/ventas/`, { params });
    return response.data;
  },

  getVenta: async (id) => {
    // Genera: /api/ventas/ventas/1/
    const response = await api.get(`${MODULE_URL}/ventas/${id}/`);
    return response.data;
  },

  crearVenta: async (data) => {
    // ADAPTADOR FRONT -> BACK
    // El Serializer espera snake_case específico
    const payload = {
      cliente_id: data.cliente_id, // CORREGIDO: Debe coincidir con el serializer
      turno_id: data.turno_id,     // CORREGIDO: Debe coincidir con el serializer
      venta_medio_pago: data.metodo_pago, 
      venta_descuento: data.descuento || 0,
      
      // Arrays de detalles (El backend los procesa en el loop)
      servicios: data.servicios || [], 
      productos: data.productos || [] 
    };
    
    // Genera: POST /api/ventas/ventas/
    const response = await api.post(`${MODULE_URL}/ventas/`, payload);
    return response.data;
  },

  anularVenta: async (id, idEstadoAnulado) => {
    // Backend espera el ID del estado en el campo 'estado_venta'
    const response = await api.patch(`${MODULE_URL}/ventas/${id}/`, { 
        estado_venta: idEstadoAnulado 
    });
    return response.data;
  },

  // Endpoint auxiliar para obtener lista de estados (Para dropdowns o lógica)
  getEstadosVenta: async () => {
    // Genera: /api/ventas/estados-venta/
    const response = await api.get(`${MODULE_URL}/estados-venta/`);
    return response.data;
  },

  getResumenVentas: async (fechaInicio, fechaFin) => {
    // Genera: /api/ventas/resumen/
    // Nota: Tu vista 'resumen_ventas' actualmente no usa fechaInicio/Fin (calcula hoy/mes auto),
    // pero enviarlos no hace daño y te sirve si mejoras el backend luego.
    const response = await api.get(`${MODULE_URL}/resumen/`, {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    });
    return response.data;
  },
};