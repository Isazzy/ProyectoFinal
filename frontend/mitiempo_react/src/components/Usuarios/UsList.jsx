import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../CSS/usuarios.css";

// Función auxiliar para renderizar los "badges" de acceso basados en el rol de Django
const AccessBadges = ({ role }) => {
  if (!role) return null;
  
  // Mapeamos los roles de Django (admin, empleado, cliente) a las etiquetas de la interfaz
  const accessMap = {
    'admin': ['Admin'],
    'empleado': ['Empleado'],
    'cliente': ['Cliente'], 
  };

  const badges = accessMap[role.toLowerCase()] || [role];

  return (
    <div className="access-badges">
      {badges.map((badge, index) => (
        <span key={index} className={`badge badge-${badge.toLowerCase().replace(' ', '-')}`}>
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
  const [roleFilter, setRoleFilter] = useState('');      // Filtra por 'admin', 'empleado', 'cliente'
  const [profesionFilter, setProfesionFilter] = useState(''); // Filtra por 'peluquera', 'manicurista', etc.
  const [showFilters, setShowFilters] = useState(false); // Para mostrar/ocultar el menú de filtros
  const navigate = useNavigate();

  // Opciones para los filtros (basado en tu modelo de Django)
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
      { value: 'multi', label: 'Múltiple' },
      { value: 'unassigned', label: 'Sin asignar' },
  ];


  const fetchUsuarios = async () => {
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

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      try {
        await deleteUsuario(id);
        setUsuarios((prev) => prev.filter((u) => u.id !== id));
        toast.success("Usuario eliminado correctamente");
      } catch (error) {
        toast.error("No se pudo eliminar el usuario");
      }
    }
  };

  const handleEdit = (id) => {
      navigate(`/admin/dashboard/usuarios/edit/${id}`);
  };

  if (loading) return <p>Cargando usuarios...</p>;
  
  // LÓGICA DE FILTRADO COMBINADA
  let filteredUsers = usuarios.filter(u => {
      const fullName = (u.first_name + ' ' + u.last_name).toLowerCase();
      const email = u.email.toLowerCase();
      
      // 1. Filtrar por término de búsqueda (nombre/email)
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                            email.includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Filtrar por Rol de Usuario (Acceso)
      if (roleFilter && u.role !== roleFilter) return false;

      // 3. Filtrar por Rol Profesional
      if (profesionFilter) {
          if (profesionFilter === 'unassigned') {
              // Incluir empleados/admins sin profesión asignada
              if (u.role === 'empleado' || u.role === 'admin') {
                  return !u.rol_profesional; 
              }
              return false;
          } else {
              // Incluir solo los que tienen el rol profesional específico
              return u.rol_profesional === profesionFilter;
          }
      }
      
      return true;
  });

  return (
    <div className="user-management-container">
      {/* Encabezado principal */}
      <div className="header-box">
        <h2 className="header-title">Gestión de Usuarios</h2>
        <p className="header-subtitle">Administre la información de su equipo de trabajo y de sus clientes.</p>
      </div>
      
      {/* Barra de herramientas (Search, Filters, Add User) */}
      <div className="toolbar">
        <h3 className="all-users-count">Usuarios ({filteredUsers.length})</h3>
        <div className="search-filter-group">
          <input 
            type="text" 
            placeholder="Buscar por Nombre o Email" 
            className="search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={`btn btn-secondary btn-filters ${showFilters ? 'active-filter' : ''}`}
            onClick={() => setShowFilters(!showFilters)} // Toggle del menú
          >
            Filtros
          </button>
          <button 
            className="btn btn-primary btn-add-user"
            onClick={() => navigate("/admin/dashboard/usuarios/create")}
          >
            Agregar Usuario
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE DE FILTROS */}
      {showFilters && (
          <div className="filters-dropdown-menu">
              {/* Filtro por Acceso (Rol de Usuario) */}
              <div className="filter-group">
                  <label>Filtrar por Acceso:</label>
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                      {roleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
              </div>

              {/* Filtro por Rol Profesional */}
              <div className="filter-group">
                  <label>Filtrar por Rol Profesional:</label>
                  <select value={profesionFilter} onChange={(e) => setProfesionFilter(e.target.value)}>
                      {profesionOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
              </div>
              
              {/* Botón para resetear filtros */}
              {(roleFilter || profesionFilter) && (
                  <button 
                      className="btn btn-reset-filters" 
                      onClick={() => { setRoleFilter(''); setProfesionFilter(''); }}
                  >
                      Limpiar Filtros
                  </button>
              )}
          </div>
      )}

      {/* Títulos de las columnas (cabecera de la tabla) */}
      <div className="user-list-header">
        <div className="col-checkbox"></div>
        <div className="col-user-name">Usuario</div>
        <div className="col-access">Acceso</div>
        <div className="col-rol">Rol</div>
        <div className="col-actions list-actions-header">Acciones</div>
      </div>

      {/* Lista de Usuarios */}
      <ul className="user-list">
        {filteredUsers.length === 0 ? (
          <li className="no-users-message">No hay usuarios registrados.</li>
        ) : (
          filteredUsers.map((u) => (
            <li key={u.id} className="user-row">
              <div className="col-checkbox"><input type="checkbox" /></div>
              
              {/* Columna Usuario (Nombre y Email) */}
              <div className="col-user-name">
                <div className="profile-pic">
                  {u.first_name ? u.first_name[0] : 'U'} 
                </div>
                <div className="user-info">
                  <div className="user-full-name">{u.first_name} {u.last_name}</div>
                  <div className="user-email">{u.email}</div>
                </div>
              </div>

              {/* Columna Acceso (Admin/Empleado/Cliente) */}
              <div className="col-access">
                <AccessBadges role={u.role || 'cliente'} /> 
              </div>
              
              {/* Columna Rol Profesional (Peluquera, etc.) */}
              <div className="col-rol">
                {u.rol_profesional ? 
                    <span className="rol-profesional-text">
                        {u.rol_profesional.charAt(0).toUpperCase() + u.rol_profesional.slice(1)}
                    </span> 
                    : <span className="text-muted">–</span>}
              </div>

              {/* Columna Acciones (Editar y Eliminar) */}
              <div className="col-actions list-actions-buttons">
                <button 
                    className="btn btn-edit-list"
                    onClick={() => handleEdit(u.id)}
                >
                    Editar
                </button>
                <button 
                    className="btn btn-delete-list"
                    onClick={() => handleDelete(u.id)}
                >
                    Eliminar
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      
      {/* Paginación */}
      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn">4</button>
        <button className="page-btn">5</button>
        <button className="page-btn">6</button>
      </div>
    </div>
  );
}