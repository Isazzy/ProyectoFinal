// src/components/Productos/Imgur.jsx
export const uploadToImgur = async (file) => {
  const clientId = "TU_CLIENT_ID_IMGUR"; 
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (data.success) {
    return data.data.link; // url pública
  } else {
    throw new Error("Imagen no se pudo subir a Imgur");
  }
};
