// front/src/api/usuarios.js
import axios from "axios";

const usuariosApi = axios.create({
  baseURL: "http://127.0.0.1:8000/api/usuarios/",
});

usuariosApi.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const authHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsuarios = async () => (await usuariosApi.get("/", { headers: authHeader() })).data;
export const getUsuario = async (id) => (await usuariosApi.get(`${id}/`, { headers: authHeader() })).data;
export const createUsuario = async (usuario) => (await usuariosApi.post("/", usuario, { headers: authHeader() })).data;
export const updateUsuario = async (id, usuario) => (await usuariosApi.put(`${id}/`, usuario, { headers: authHeader() })).data;
export const deleteUsuario = async (id) => (await usuariosApi.delete(`${id}/`, { headers: authHeader() })).data;
