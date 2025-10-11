// src/api/servicios.js

const API_URL = "http://localhost:8000/api/servicios/";

export async function getServicios() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Error al obtener servicios");
  return response.json();
}

export async function createServicio(servicio) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(servicio),
  });
  if (!response.ok) throw new Error("Error al crear servicio");
  return response.json();
}

export async function updateServicio(id, servicio) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(servicio),
  });
  if (!response.ok) throw new Error("Error al actualizar servicio");
  return response.json();
}

export async function deleteServicio(id) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error al eliminar servicio");
}
