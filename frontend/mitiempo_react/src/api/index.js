import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleIngresar = () => {
    navigate("/Login");
  };

  return (
    <div className="landing-container">
      <h1>Bienvenido a MiTiempo</h1>
      <p>Gestioná tus turnos de forma simple y rápida.</p>
      <button onClick={handleIngresar} className="btn-ingresar">
        Ingresar
      </button>
    </div>
  );
}



// front/src/api/index.js
const API_URL = "http://127.0.0.1:8000/api";

// 🔹 Helper genérico para GET con token
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }

  return res.json();
};

// 🔹 Servicios
export const fetchServicios = () => authFetch("/servicios/");

// 🔹 Usuarios (profesionales, clientes, etc.)
export const fetchUsuarios = () => authFetch("/usuarios/");

// 🔹 Turnos (GET)
export const fetchTurnos = () => authFetch("/turnos/");

// 🔹 Crear turno (POST)
export const createTurno = async (payload) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_URL}/turnos/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error ${res.status}: ${text}`);
  }

  return res.json();
};
