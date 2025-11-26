import { useEffect, useState } from "react";
import { getNotificaciones } from "../api/notificaciones";

export const useNotificaciones = () => {
  const [items, setItems] = useState([]);

  const cargar = async () => {
    try {
      const data = await getNotificaciones();
      setItems(data);
    } catch (err) {
      console.error("Error cargando notificaciones", err);
    }
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 10000); // refresco automático cada 10 seg
    return () => clearInterval(interval);
  }, []);

  return { items, cargar };
};
