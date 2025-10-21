import React, { useEffect, useState } from "react";
import { getServicios, deleteServicio } from "../../api/servicios";
import { useNavigate } from "react-router-dom";

export default function ServiciosList() {
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchServicios = async () => {
    try {
      const res = await getServicios();
      console.log("📦 Servicios cargados:", res.data);
      setServicios(res.data);
    } catch (err) {
      console.error("❌ Error al cargar servicios:", err);
      setError("Error al cargar los servicios");
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    try {
      await deleteServicio(id);
      fetchServicios();
    } catch (err) {
      console.error("❌ Error al eliminar servicio:", err);
      alert("Error al eliminar el servicio");
    }
  };

  return (
    <div className="container">
      <h2>Gestión de Servicios</h2>
      <button onClick={() => navigate("/admin/servicios/create")}>
        Nuevo Servicio
      </button>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id_serv}>
              <td>{s.nombre_serv}</td>
              <td>{s.tipo_serv}</td>
              <td>${s.precio_serv}</td>
              <td>{s.activado ? "Sí" : "No"}</td>
              <td>
                <button onClick={() => navigate(`/admin/servicios/edit/${s.id_serv}`)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(s.id_serv)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
