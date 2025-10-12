// front/src/api/turnos.js

const API_URL = "http://127.0.0.1:8000/api/turnos/";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTurnos = async () => {
  try {
    const res = await fetch(API_URL, { headers: getAuthHeader() });
    if (!res.ok) throw new Error("Error al obtener turnos");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createTurno = async (nuevoTurno) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(nuevoTurno),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const errorMsg =
        errorData.non_field_errors?.[0] ||
        errorData.detail ||
        "Error desconocido al crear el turno.";
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Error en createTurno:", error);
    throw error;
  }
};

export const updateTurno = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar turno");

    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteTurno = async (id) => {
  try {
    const res = await fetch(`${API_URL}${id}/`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!res.ok) throw new Error("Error al eliminar turno");
  } catch (error) {
    console.error(error);
    throw error;
  }
};
