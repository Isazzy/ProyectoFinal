import React, { useEffect, useState } from "react";
import { getServicios, deleteServicio } from "../../api/servicios";
import { useNavigate } from "react-router-dom";

function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();

  const cargarServicios = async () => {
    try {
      const { data } = await getServicios();
      console.log(" Servicios cargados:", data);
      setServicios(data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const manejarEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este servicio?")) {
      try {
        await deleteServicio(id);
        cargarServicios();
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Servicios</h2>
        <button
          onClick={() => navigate("/admin/dashboard/servicios/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
           Crear servicio
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Nombre</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Duración</th>
            <th className="p-2">Disponible</th>
            <th className="p-2">Activo</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id_serv} className="border-t hover:bg-gray-100">
              <td className="p-2">{s.nombre_serv}</td>
              <td className="p-2">{s.tipo_serv}</td>
              <td className="p-2">${s.precio_serv}</td>
              <td className="p-2">{s.duracion_serv}</td>
              <td className="p-2">{s.disponible_serv ? "Sí" : "No"}</td>
              <td className="p-2">{s.activado ? "✅" : "❌"}</td>
              <td className="p-2 text-center space-x-2">
                <button
                  onClick={() => navigate(`/admin/dashboard/servicios/edit/${s.id_serv}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => manejarEliminar(s.id_serv)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminServicios;
