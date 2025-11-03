import React, { useEffect, useState } from "react";
import { getServicios, deleteServicio } from "../../api/servicios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Common/Modal"; 

function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServicioId, setSelectedServicioId] = useState(null);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const { data } = await getServicios();
      setServicios(data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  const handleShowDeleteModal = (id) => {
    setSelectedServicioId(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setSelectedServicioId(null);
    setShowDeleteModal(false);
  };

  const manejarEliminar = async () => {
    if (!selectedServicioId) return;
    
    try {
      await deleteServicio(selectedServicioId);
      handleCloseModal(); 
      cargarServicios(); 
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      handleCloseModal();
    }
  };

  if (loading) return <p>Cargando servicios...</p>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Gestión de Servicios</h2>
        <button
          onClick={() => navigate("/admin/dashboard/servicios/create")}
          className="btn btn-primary" 
        >
          Crear servicio
        </button>
      </div>

      <table className="styled-table">
        {/* --- CAMBIO --- Cabecera de la tabla actualizada */}
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Días Disponibles</th>
            <th>Activo</th>
            <th style={{ textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        {/* --- FIN CAMBIO --- */}

        <tbody>
          {servicios.map((s) => (
            // --- CAMBIO --- Fila de la tabla actualizada
            <tr key={s.id_serv}>
              <td data-label="Nombre">{s.nombre_serv}</td>
              <td data-label="Tipo">{s.tipo_serv}</td>
              <td data-label="Precio">${s.precio_serv}</td>
              {/* Muestra 'duracion_minutos' en lugar de 'duracion_serv' */}
              <td data-label="Duración">{s.duracion_minutos} min</td>
              {/* Muestra el nuevo campo 'dias_disponibles' */}
              <td data-label="Días Disponibles" style={{ textTransform: 'capitalize' }}>
                {(s.dias_disponibles || []).join(', ')}
              </td>
              <td data-label="Activo">{s.activado ? "✅" : "❌"}</td>
              <td data-label="Acciones" className="table-actions">
                <button
                  onClick={() => navigate(`/admin/dashboard/servicios/edit/${s.id_serv}`)}
                  className="btn btn-secondary" 
                >
                  Editar
                </button>
                <button
                  onClick={() => handleShowDeleteModal(s.id_serv)} 
                  className="btn btn-danger" 
                >
                  Eliminar
                </button>
              </td>
            </tr>
            // --- FIN CAMBIO ---
          ))}
        </tbody>
      </table>

      {/* Modal de confirmación (sin cambios) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseModal}
        title="Confirmar Eliminación"
        footer={
          <>
            <button onClick={handleCloseModal} className="btn btn-secondary">
              Cancelar
            </button>
            <button onClick={manejarEliminar} className="btn btn-danger">
              Eliminar
            </button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.</p>
      </Modal>

      {/* Estilos (sin cambios) */}
      <style>{`
        .admin-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .admin-page-header h2 {
          margin-bottom: 0;
        }
        .table-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .table-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminServicios;