// src/api/notificaciones.js
import api from "./axiosConfig";

export const getNotificaciones = async () => {
  const response = await api.get("/turnos/");
  return response.data
    .filter(t =>
      t.estado === "pendiente" ||
      t.estado === "cancelado" ||
      (t.comprobante_url && t.estado_pago === "seña")
    )
    .map(t => ({
      id: t.id,
      fecha: t.fecha_hora_inicio,
      cliente: t.cliente,
      estado: t.estado,
      estado_pago: t.estado_pago,
      comprobante_url: t.comprobante_url,
      servicios: t.servicios
    }));
};
