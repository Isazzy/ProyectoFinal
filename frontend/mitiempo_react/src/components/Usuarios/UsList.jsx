// front/src/pages/Admin/UsList.jsx
import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import toast from "react-hot-toast";
<<<<<<< HEAD

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
=======
import Modal from "../../components/Common/Modal";
import UsForm from "../../components/Usuarios/UsFrom";
import "../../CSS/UsList.css";
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be

// 🔹 Componente para mostrar las insignias de grupo
const AccessBadges = ({ groups }) => {
  if (!groups || groups.length === 0) return null;
  return (
    <div className="access-badges">
<<<<<<< HEAD
      {badges.map((badge, index) => (
        <span key={index} className={`badge badge-${badge.toLowerCase()}`}>
          {badge}
=======
      {groups.map((g, i) => (
        <span key={i} className={`badge badge-${g.toLowerCase()}`}>
          {g}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
        </span>
      ))}
    </div>
  );
};

export default function UsList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
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

=======
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // 🔹 Detectar rol desde localStorage (normalizado a minúsculas)
  const rawRole = localStorage.getItem("role") || "cliente";
  const role = rawRole.toLowerCase();
  const isAdmin = role === "administrador";
  const isEmpleado = role === "empleado";

  console.log("🔍 Rol detectado:", rawRole, "| Normalizado:", role);

  // 🔹 Opciones de filtro por grupo
  const groupOptions = [
    { value: "", label: "Todos los Grupos" },
    { value: "Administrador", label: "Administrador" },
    { value: "Empleado", label: "Empleado" },
    { value: "Cliente", label: "Cliente" },
  ];

  // 🔹 Obtener lista de usuarios
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await getUsuarios();
      const data = Array.isArray(res.data) ? res.data : [];

      const normalized = data.map((u) => ({
        ...u,
        telefono: u.telefono || "",
        groups:
          u.groups?.map((g) => (typeof g === "string" ? g : g.name)) ||
          ["Cliente"],
      }));

      setUsuarios(normalized);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

<<<<<<< HEAD
  const handleOpenCreateModal = () => {
    setSelectedUserId(null); 
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (id) => {
    setSelectedUserId(id); 
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (id) => {
=======
  // 🔹 Abrir modal de creación
  const handleOpenCreateModal = () => {
    if (!isAdmin) return;
    setSelectedUserId(null);
    setIsFormModalOpen(true);
  };

  // 🔹 Abrir modal de edición
  const handleOpenEditModal = (id) => {
    if (!isAdmin) return;
    setSelectedUserId(id);
    setIsFormModalOpen(true);
  };

  // 🔹 Abrir modal de eliminación
  const handleOpenDeleteModal = (id) => {
    if (!isAdmin) return;
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

<<<<<<< HEAD
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
=======
  // 🔹 Cerrar modal de formulario
  const handleFormClose = (didSave) => {
    setIsFormModalOpen(false);
    setSelectedUserId(null);
    if (didSave) fetchUsuarios();
  };

  // 🔹 Confirmar eliminación
  const handleDeleteConfirm = async () => {
    if (!selectedUserId) return;
    try {
      await deleteUsuario(selectedUserId);
      setUsuarios((prev) => prev.filter((u) => u.id !== selectedUserId));
      toast.success("Usuario eliminado correctamente");
    } catch {
      toast.error("No se pudo eliminar el usuario");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
    }
  };

  // 🔹 Filtrar usuarios por búsqueda y grupo
  const filteredUsers = usuarios.filter((u) => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const email = u.email.toLowerCase();
    const telefono = u.telefono?.toLowerCase() || "";
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      telefono.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (groupFilter && !u.groups.includes(groupFilter)) return false;
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    return true;
  });
  // ----------------------------------------------------

  if (loading) return <p>Cargando usuarios...</p>;

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="admin-page-container">
<<<<<<< HEAD
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
=======
      <div className="admin-page-header">
        <h2>Gestión de Usuarios</h2>
        {/* ✅ Solo visible si el rol es administrador */}
        {isAdmin && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            Agregar Usuario
          </button>
        )}
      </div>

      <div className="toolbar">
        <h3 className="toolbar-title">Usuarios ({filteredUsers.length})</h3>
        <div className="search-filter-group">
          <input
            type="text"
            placeholder="Buscar por Nombre, Email o Teléfono"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-select"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            {groupOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Teléfono</th>
            <th>Grupo</th>
            {isAdmin && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? "4" : "3"} className="text-center">
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-info-cell">
                    <div className="profile-pic-small">
                      {u.first_name ? u.first_name[0] : "U"}
                    </div>
                    <div className="user-info-text">
                      <div className="user-full-name">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>{u.telefono || "—"}</td>
                <td>
                  <AccessBadges groups={u.groups || ["Cliente"]} />
                </td>
                {isAdmin && (
                  <td className="table-actions">
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
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 🔹 Modal de formulario (crear / editar) */}
      {isFormModalOpen && (
        <UsForm userId={selectedUserId} onClose={handleFormClose} />
      )}

      {/* 🔹 Modal de confirmación de eliminación */}
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
<<<<<<< HEAD
            <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">Cancelar</button>
            <button onClick={handleDeleteConfirm} className="btn btn-danger">Eliminar Usuario</button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer.</p>
      </Modal>

      {/* 💡 3. El bloque <style> se ha eliminado */}
=======
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button onClick={handleDeleteConfirm} className="btn btn-danger">
              Eliminar Usuario
            </button>
          </>
        }
      >
        <p>¿Estás seguro de que deseas eliminar a este usuario?</p>
      </Modal>
>>>>>>> 516c6e32d07084ab8a27435fa8206757c1f490be
    </div>
  );
}
