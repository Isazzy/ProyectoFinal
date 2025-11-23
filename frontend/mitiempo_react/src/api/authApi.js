// src/api/authApi.js
import api from "./axiosConfig";

export const login = async (email, password) => {
  const res = await api.post("/login/", { email, password });
  localStorage.setItem("token", res.data.access);
  return res.data;
};

export const registerCliente = async (data) => {
  return api.post("/clientes/register/", data);
};

export const logout = () => {
  localStorage.removeItem("token");
};
