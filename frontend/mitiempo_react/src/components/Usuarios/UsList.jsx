import React, { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../../api/Usuarios";
import toast from "react-hot-toast";
import Modal from "../../components/Common/Modal";
import UsForm from "../../components/Usuarios/UsFrom";
import "../../CSS/UsList.css";

// 🔹 Componente para mostrar las insignias de grupo
const AccessBadges = ({ groups }) => {
  if (!groups || groups.length === 0) return null;
  return (
    <div className="access-badges">
      {groups.map((g, i) => (
        <span key={i} className={`badge badge-${g.toLowerCase()}`}>
          {g}
        </span>
      ))}
    </div>
  );
};

export default function UsList() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

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
    return true;
  });

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="admin-page-container">
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
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        footer={
          <>
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
    </div>
  );
}
