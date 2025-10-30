// front/src/pages/Admin/UsList.jsx
import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 💡 1. Importa los componentes de Modal y Formulario
import Modal from "../../components/Common/Modal"; 
import UsForm from "../../components/Usuarios/UsFrom"; 

// 💡 (Tu componente de Badges está perfecto, lo movemos aquí)
const AccessBadges = ({ role }) => {
  if (!role) return null;
  const accessMap = {
    'admin': ['Admin'],
    'empleado': ['Empleado'],
    'cliente': ['Cliente'], 
  };
  const badges = accessMap[role.toLowerCase()] || [role];

  return (
    <div className="access-badges">
      {badges.map((badge, index) => (
        <span key={index} className={`badge badge-${badge.toLowerCase()}`}>
          {badge}
        </span>
      ))}
    </div>
  );
};


export default function UsList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [roleFilter, setRoleFilter] = useState(''); 
  const [profesionFilter, setProfesionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // 💡 2. Estado para manejar los modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); // null para "Crear"

  const roleOptions = [
     { value: '', label: 'Todos los Roles' }, /* ... */
  ];
  const profesionOptions = [
     { value: '', label: 'Todas las Profesiones' }, /* ... */
  ];

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios();
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // 💡 3. Funciones para abrir los modales
  const handleOpenCreateModal = () => {
    setSelectedUserId(null); // Pone el form en modo "Crear"
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (id) => {
    setSelectedUserId(id); // Pone el form en modo "Editar"
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  // 💡 4. Función para cerrar y refrescar desde el modal
  const handleFormClose = (didSave) => {
    setIsFormModalOpen(false);
    setSelectedUserId(null);
    if (didSave) { // Si el formulario guardó, refrescamos la lista
      fetchUsuarios();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUsuario(selectedUserId);
      setUsuarios((prev) => prev.filter((u) => u.id !== selectedUserId));
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error("No se pudo eliminar el usuario");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
    }
  };

  // Tu lógica de filtrado (sin cambios, está perfecta)
  let filteredUsers = usuarios.filter(u => {
    const fullName = (u.first_name + ' ' + u.last_name).toLowerCase();
    const email = u.email.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (profesionFilter) {
      if (profesionFilter === 'unassigned') {
        if (u.role === 'empleado' || u.role === 'admin') return !u.rol_profesional; 
        return false;
      } else {
        return u.rol_profesional === profesionFilter;
      }
    }
    return true;
  });

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    // 💡 5. Contenedor de página estándar (de AdminServicios)
    <div className="admin-page-container">
      {/* Encabezado */}
      <div className="admin-page-header">
        <h2>Gestión de Usuarios</h2>
        <button
          onClick={handleOpenCreateModal} // 💡 Abre el modal de formulario
          className="btn btn-primary" 
        >
          Agregar Usuario
        </button>
      </div>

      {/* 💡 6. Barra de herramientas y filtros (re-estilizada) */}
      <div className="toolbar">
        <h3 className="toolbar-title">Usuarios ({filteredUsers.length})</h3>
        <div className="search-filter-group">
          <input 
            type="text" 
            placeholder="Buscar por Nombre o Email" 
            className="form-input" // 💡 Clase global
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={`btn btn-secondary ${showFilters ? 'active-filter' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </button>
        </div>
      </div>

      {/* 💡 7. Menú de filtros (re-estilizado) */}
      {showFilters && (
        <div className="filters-menu">
          <div className="form-group">
            <label>Filtrar por Acceso:</label>
            <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              {roleOptions.map(opt => ( <option key={opt.value} value={opt.value}>{opt.label}</option> ))}
            </select>
          </div>
          <div className="form-group">
            <label>Filtrar por Rol Profesional:</label>
            <select className="form-select" value={profesionFilter} onChange={(e) => setProfesionFilter(e.target.value)}>
              {profesionOptions.map(opt => ( <option key={opt.value} value={opt.value}>{opt.label}</option> ))}
            </select>
          </div>
          {(roleFilter || profesionFilter) && (
            <button 
              className="btn btn-secondary btn-reset-filters" 
              onClick={() => { setRoleFilter(''); setProfesionFilter(''); }}
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      )}

      {/* 💡 8. Tabla Estilizada (en lugar de <ul>) */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Acceso</th>
            <th>Rol Profesional</th>
            <th style={{ textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>No se encontraron usuarios.</td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                {/* Columna Usuario (Nombre y Email) */}
                <td data-label="Usuario">
                  <div className="user-info-cell">
                    <div className="profile-pic-small">
                      {u.first_name ? u.first_name[0] : 'U'} 
                    </div>
                    <div className="user-info-text">
                      <div className="user-full-name">{u.first_name} {u.last_name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </div>
                </td>

                {/* Columna Acceso */}
                <td data-label="Acceso">
                  <AccessBadges role={u.role || 'cliente'} /> 
                </td>
                
                {/* Columna Rol Profesional */}
                <td data-label="Rol Profesional">
                  {u.rol_profesional ? 
                    <span className="rol-profesional-text">
                      {u.rol_profesional.charAt(0).toUpperCase() + u.rol_profesional.slice(1)}
                    </span> 
                    : <span className="text-muted">–</span>}
                </td>

                {/* Columna Acciones */}
                <td data-label="Acciones" className="table-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleOpenEditModal(u.id)} // 💡 Abre modal de edición
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleOpenDeleteModal(u.id)} // 💡 Abre modal de borrado
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* (Tu paginación) */}

      {/* 💡 9. MODALES (reemplazan a window.confirm y la página de formulario) */}
      
      {/* Modal para Crear/Editar */}
      {isFormModalOpen && (
        <UsForm 
          userId={selectedUserId} 
          onClose={handleFormClose} 
        />
      )}

      {/* Modal para Eliminar */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleDeleteConfirm} className="btn btn-danger">Eliminar Usuario</button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.</p>
      </Modal>

      {/*  CSS Local para estilos específicos de esta página */}
      <style>{`
        /* --- Toolbar y Filtros --- */
        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color); 
          margin-bottom: 1rem;
        }
        .toolbar-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }
        .search-filter-group { display: flex; gap: 10px; }
        .search-filter-group .form-input { 
          background-color: var(--bg-color-light); 
          width: 250px;
        }
        .filters-menu {
          background-color: var(--bg-color-light);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }
        .btn-reset-filters { background: var(--bg-color); }
        .btn-reset-filters:hover { background: var(--border-color); }

        /* --- Estilos de Celdas --- */
        .user-info-cell { display: flex; align-items: center; gap: 10px; }
        .profile-pic-small {
          width: 32px; height: 32px;
          border-radius: 50%;
          background-color: var(--primary-color-light);
          color: var(--primary-color);
          display: flex; justify-content: center; align-items: center;
          font-weight: 600; font-size: 0.9rem;
          flex-shrink: 0;
        }
        .user-full-name { font-weight: 600; color: var(--text-color); }
        .user-email { font-size: 0.85rem; color: var(--text-color-muted); }
        
        .access-badges { display: flex; gap: 5px; flex-wrap: wrap; }
        .badge {
          padding: 4px 8px; border-radius: 12px; font-size: 0.75rem;
          font-weight: 500; text-transform: capitalize;
        }
        .badge-admin { background-color: rgba(225, 29, 72, 0.1); color: var(--danger-color); }
        .badge-empleado { background-color: rgba(202, 138, 4, 0.1); color: var(--warning-color); }
        .badge-cliente { background-color: rgba(5, 150, 105, 0.1); color: var(--success-color); }

        .rol-profesional-text { color: var(--text-color-muted); }
        .text-muted { color: var(--text-color-muted); }
      `}</style>
    </div>
  );
}