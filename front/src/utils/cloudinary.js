// src/utils/cloudinary.js

const CLOUD_NAME = "diqndk92p"; // <--- CAMBIA ESTO
const UPLOAD_PRESET = "mitiempo"; // <--- CAMBIA ESTO

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error detallado Cloudinary:", errorData);
      throw new Error(`Error subiendo imagen: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("Subida exitosa:", data.secure_url);
    return data.secure_url; // Retorna la URL https
  } catch (error) {
    console.error("Error en uploadToCloudinary:", error);
    throw error; // Re-lanzamos el error para atraparlo en el formulario
  }
};