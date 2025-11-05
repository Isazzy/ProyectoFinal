// front/src/pages/Admin/UsList.jsx
import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Modal from "../../components/Common/Modal"; 
import UsForm from "../../components/Usuarios/UsFrom"; 

// 💡 1. Importamos el nuevo archivo CSS
import "../../CSS/UsList.css";

// --- Componente de Badges (ahora usa clases del new CSS) ---
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
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null); 

  // --- Lógica de Opciones, fetch y Handlers (sin cambios) ---
  const roleOptions = [
     { value: '', label: 'Todos los Roles' },
     { value: 'admin', label: 'Administrador' },
     { value: 'empleado', label: 'Empleado' },
     { value: 'cliente', label: 'Cliente' },
  ];
  const profesionOptions = [
     { value: '', label: 'Todas las Profesiones' },
     { value: 'peluquera', label: 'Peluquera' },
     { value: 'manicurista', label: 'Manicurista' },
     { value: 'estilista', label: 'Estilista' },
     { value: 'multi', label: 'Multi' },
     { value: 'unassigned', label: 'Sin asignar (Empleado)' },
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

  const handleOpenCreateModal = () => {
    setSelectedUserId(null); 
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (id) => {
    setSelectedUserId(id); 
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  const handleFormClose = (didSave) => {
    setIsFormModalOpen(false);
    setSelectedUserId(null);
    if (didSave) { 
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
  // ----------------------------------------------------

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="admin-page-container">
      {/* Encabezado */}
      <div className="admin-page-header">
        <h2>Gestión de Usuarios</h2>
        <button
          onClick={handleOpenCreateModal} 
          className="btn btn-primary" 
        >
          Agregar Usuario
        </button>
      </div>

      {/* Barra de herramientas y filtros */}
      <div className="toolbar">
        <h3 className="toolbar-title">Usuarios ({filteredUsers.length})</h3>
        <div className="search-filter-group">
          <input 
            type="text" 
            placeholder="Buscar por Nombre o Email" 
            className="form-input" // Clase global
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

      {/* Menú de filtros */}
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

      {/* Tabla Estilizada */}
      <table className="styled-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Acceso</th>
            <th>Rol Profesional</th>
            {/* 💡 2. Usamos una clase en lugar de style */}
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              {/* 💡 2. Usamos una clase en lugar de style */}
              <td colSpan="4" className="text-center">No se encontraron usuarios.</td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                {/* Columna Usuario */}
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
                    onClick={() => handleOpenEditModal(u.id)} 
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleOpenDeleteModal(u.id)} 
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {/* (Paginación iría aquí) */}

      {/* --- MODALES --- */}
      
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

      {/* 💡 3. El bloque <style> se ha eliminado */}
    </div>
  );
}