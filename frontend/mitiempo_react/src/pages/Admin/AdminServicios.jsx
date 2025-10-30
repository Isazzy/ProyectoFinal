// front/src/pages/Admin/AdminServicios.jsx
import React, { useEffect, useState } from "react";
import { getServicios, deleteServicio } from "../../api/servicios";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Common/Modal"; // 💡 1. Importa el Modal

function AdminServicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 💡 2. Estado para el modal de confirmación
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

  // 💡 3. Abre el modal en lugar de usar window.confirm
  const handleShowDeleteModal = (id) => {
    setSelectedServicioId(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setSelectedServicioId(null);
    setShowDeleteModal(false);
  };

  // 4. Lógica de eliminación (llamada desde el modal)
  const manejarEliminar = async () => {
    if (!selectedServicioId) return;
    
    try {
      await deleteServicio(selectedServicioId);
      handleCloseModal(); // Cierra el modal
      cargarServicios(); // Recarga la lista
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      handleCloseModal();
    }
  };

  if (loading) return <p>Cargando servicios...</p>;

  return (
    // 💡 5. Contenedor principal sin clases de Tailwind ni márgenes del sidebar
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Gestión de Servicios</h2>
        <button
          onClick={() => navigate("/admin/dashboard/servicios/create")}
          className="btn btn-primary" // 💡 6. Clase de botón global
        >
          Crear servicio
        </button>
      </div>

      {/* 💡 7. Tabla con la clase de estilo global */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Duración</th>
            <th>Activo</th>
            <th style={{ textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((s) => (
            <tr key={s.id_serv}>
              <td data-label="Nombre">{s.nombre_serv}</td>
              <td data-label="Tipo">{s.tipo_serv}</td>
              <td data-label="Precio">${s.precio_serv}</td>
              <td data-label="Duración">{s.duracion_serv}</td>
              <td data-label="Activo">{s.activado ? "✅" : "❌"}</td>
              <td data-label="Acciones" className="table-actions">
                <button
                  onClick={() => navigate(`/admin/dashboard/servicios/edit/${s.id_serv}`)}
                  className="btn btn-secondary" // 💡 8. Clases de botón global
                >
                  Editar
                </button>
                <button
                  onClick={() => handleShowDeleteModal(s.id_serv)} // 💡 9. Llama al modal
                  className="btn btn-danger" 
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 💡 10. Modal de confirmación */}
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

      {/* CSS para alinear los botones en la tabla */}
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
        /* Responsividad de botones en tabla */
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