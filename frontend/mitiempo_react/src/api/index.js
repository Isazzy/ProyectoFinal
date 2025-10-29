// front/src/api/index.js
import api from "./axiosConfig";

//  Servicios
export const fetchServicios = async () => {
  const res = await api.get("/servicios/");
  return res.data;
};

//  Usuarios
export const fetchUsuarios = async () => {
  const res = await api.get("/usuarios/");
  return res.data;
};

//  Turnos
export const fetchTurnos = async () => {
  const res = await api.get("/turnos/");
  return res.data;
};

// Crear turno
export const createTurno = async (payload) => {
  const res = await api.post("/turnos/", payload);
  return res.data;
};
