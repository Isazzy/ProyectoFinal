import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export const login = async (email, password) => {
  const response = await api.post("token/", {
    username: email, // o email, según tu modelo
    password,
  });
  localStorage.setItem("token", response.data.access);
  return response.data;
};

export const getUsuarios = async () => {
  const token = localStorage.getItem("token");
  return api.get("usuarios/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
