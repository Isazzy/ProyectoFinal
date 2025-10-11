import React, { useEffect, useState } from "react";
import { getServicios, createServicio, updateServicio, deleteServicio } from "../../api/servicios";

function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    tipo_serv: "",
    nombre_serv: "",
    precio_serv: "",
    duracion_serv: "",
    descripcion_serv: "",
    activado: true,
  });

  const cargarServicios = async () => {
    const data = await getServicios();
    setServicios(data);
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createServicio(nuevoServicio);
    setNuevoServicio({ tipo_serv: "", nombre_serv: "", precio_serv: "", duracion_serv: "", descripcion_serv: "", activado: true });
    cargarServicios();
  };

  const handleToggle = async (servicio) => {
    await updateServicio(servicio.id_serv, { ...servicio, activado: !servicio.activado });
    cargarServicios();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este servicio?")) {
      await deleteServicio(id);
      cargarServicios();
    }
  };

  return (
    <div className="container">
      <h2>Gestión de Servicios</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={nuevoServicio.nombre_serv}
          onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre_serv: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Tipo"
          value={nuevoServicio.tipo_serv}
          onChange={(e) => setNuevoServicio({ ...nuevoServicio, tipo_serv: e.target.value })}
        />
        <input
          type="number"
          placeholder="Precio"
          value={nuevoServicio.precio_serv}
          onChange={(e) => setNuevoServicio({ ...nuevoServicio, precio_serv: e.target.value })}
        />
        <input
          type="text"
          placeholder="Duración (HH:MM:SS)"
          value={nuevoServicio.duracion_serv}
          onChange={(e) => setNuevoServicio({ ...nuevoServicio, duracion_serv: e.target.value })}
        />
        <textarea
          placeholder="Descripción"
          value={nuevoServicio.descripcion_serv}
          onChange={(e) => setNuevoServicio({ ...nuevoServicio, descripcion_serv: e.target.value })}
        ></textarea>
        <button type="submit">Agregar Servicio</button>
      </form>

      <hr />

      <h3>Lista de Servicios</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id_serv}>
              <td>{s.nombre_serv}</td>
              <td>{s.tipo_serv}</td>
              <td>${s.precio_serv}</td>
              <td>{s.duracion_serv}</td>
              <td>{s.activado ? "Activo" : "Inactivo"}</td>
              <td>
                <button onClick={() => handleToggle(s)}>
                  {s.activado ? "Desactivar" : "Activar"}
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

export default ServiciosAdmin;
