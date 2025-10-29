// front/src/components/Turnos/TurnoLista.jsx
import React, { useEffect, useState } from "react";
import { getTurnos, deleteTurno } from "../../api/turnos";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function TurnoLista() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTurnos = async () => {
    try {
      const res = await getTurnos();
      setTurnos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando turnos:", error);
      toast.error("No se pudieron cargar los turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este turno?")) {
      try {
        await deleteTurno(id);
        setTurnos((prev) => prev.filter((t) => t.id_turno !== id));
        toast.success("Turno eliminado");
      } catch (error) {
        console.error("Error eliminando turno:", error);
        toast.error("Error al eliminar el turno");
      }
    }
  };

  if (loading) return <p>Cargando turnos...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Turnos Registrados</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/dashboard/turnos/create")}
        >
          Crear Turno
        </button>
      </div>

      {turnos.length === 0 ? (
        <p>No hay turnos registrados.</p>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Profesional</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id_turno}>
                <td>{t.fecha_turno}</td>
                <td>{t.hora_turno}</td>
                <td>{t.profesional_nombre || "—"}</td>
                <td>{t.cliente_nombre || "—"}</td>
                <td>{t.estado_turno}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(t.id_turno)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
