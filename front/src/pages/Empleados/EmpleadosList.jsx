// ========================================
// src/pages/Empleados/EmpleadosList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, User, Trash2, Search } from 'lucide-react';
import { useEmpleados } from '../../hooks/useEmpleados';
import { Card, Button, Badge, Modal, Input } from '../../components/ui';
import styles from '../../styles/Empleados.module.css';

// ===============================
// FORMULARIO DE EMPLEADO
// ===============================
const EmpleadoForm = ({ empleado, roles, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    first_name: empleado?.first_name || "",
    last_name: empleado?.last_name || "",
    email: empleado?.email || "",
    dni: empleado?.empleado?.dni || "",
    telefono: empleado?.empleado?.telefono || "",
    especialidad: empleado?.empleado?.especialidad || "otro",
    rol: empleado?.empleado?.rol || "",
    username: "", 
    password: ""
  });

  const isEditMode = !!empleado;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <Input label="Nombre" name="first_name" value={form.first_name} onChange={handleChange} required />
        <Input label="Apellido" name="last_name" value={form.last_name} onChange={handleChange} required />
      </div>

      <div className={styles.formRow}>
        <Input label="DNI" name="dni" value={form.dni} onChange={handleChange} />
        <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
      </div>

      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />

      <div className={styles.formRow}>
        <div className={styles.selectGroup}>
          <label>Rol</label>
          <select name="rol" value={form.rol} onChange={handleChange} required className={styles.select}>
            <option value="">Seleccione un rol</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label>Especialidad</label>
          <select name="especialidad" value={form.especialidad} onChange={handleChange} className={styles.select}>
            <option value="peluquera">Peluquera</option>
            <option value="manicurista">Manicurista</option>
            <option value="maquilladora">maquilladora</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {!isEditMode && (
        <>
           <hr className={styles.divider} />
           <p className={styles.subtitle}>Credenciales de Acceso</p>
           <div className={styles.formRow}>
              <Input label="Usuario" name="username" value={form.username} onChange={handleChange} required />
              <Input label="Contraseña" type="password" name="password" value={form.password} onChange={handleChange} required />
           </div>
        </>
      )}

      <div className={styles.formActions}>
        <Button type="submit" loading={loading}>
          {isEditMode ? "Guardar Cambios" : "Crear Empleado"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

// ===============================
// LISTA PRINCIPAL
// ===============================
export const EmpleadosList = () => {
  const { 
    empleados, roles, loading, 
    fetchEmpleados, fetchRoles, 
    crearEmpleado, actualizarEmpleado, eliminarEmpleado 
  } = useEmpleados();

  const [modal, setModal] = useState({ open: false, empleado: null });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmpleados();
    fetchRoles();
  }, [fetchEmpleados, fetchRoles]);

  // CORRECCIÓN APLICADA AQUÍ: Manejo de nulos con (valor || "")
  const filteredEmpleados = empleados.filter(e => {
    const term = search.toLowerCase();
    const first = (e.first_name || "").toLowerCase();
    const last = (e.last_name || "").toLowerCase();
    const mail = (e.email || "").toLowerCase();
    
    return first.includes(term) || last.includes(term) || mail.includes(term);
  });

  // En src/pages/Empleados/EmpleadosList.jsx

  const handleSubmit = async (data) => {
    if (modal.empleado) {
      // CORRECCIÓN IMPORTANTE:
      // Usamos modal.empleado.empleado.id (ID de la tabla Empleado)
      // Si por alguna razón no tiene perfil empleado, usamos el ID de usuario como fallback (aunque esto daría 404 si no existe la fila)
      
      const idParaActualizar = modal.empleado.empleado?.id;

      if (!idParaActualizar) {
        console.error("No se encontró ID de empleado para actualizar");
        return;
      }

      await actualizarEmpleado(idParaActualizar, data);
    } else {
      await crearEmpleado(data);
    }
    setModal({ open: false, empleado: null });
  };

  const handleDelete = async (empleado) => {
    await eliminarEmpleado(empleado.id, `${empleado.first_name} ${empleado.last_name}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Empleados</h1>
        <Button icon={Plus} onClick={() => setModal({ open: true, empleado: null })}>
          Nuevo Empleado
        </Button>
      </header>

      <div className={styles.filters}>
        <Input 
          placeholder="Buscar por nombre o email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          icon={Search}
        />
      </div>

      <Card>
        {!loading && filteredEmpleados.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Rol</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.map(empleado => (
                <tr key={empleado.id}>
                  <td>
                    <div className={styles.empleadoName}>
                      <div className={styles.avatar}>
                        {empleado.first_name?.[0] || <User size={16}/>}
                      </div>
                      <div className={styles.nameCol}>
                        <span className={styles.fullName}>{empleado.first_name} {empleado.last_name}</span>
                        <span className={styles.username}>@{empleado.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{empleado.rol || "Sin Rol"}</td>
                  <td>{empleado.empleado?.especialidad || "-"}</td>
                  <td className={styles.email}>{empleado.email}</td>
                  <td>
                    <Badge variant={empleado.is_active ? 'success' : 'default'}>
                      {empleado.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className={styles.actions}>
                    <button onClick={() => setModal({ open: true, empleado })}>
                      <Edit size={18} />
                    </button>
                    <button className={styles.dangerBtn} onClick={() => handleDelete(empleado)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
             {loading ? <p>Cargando...</p> : <><User size={48} /><p>No hay empleados que coincidan.</p></>}
          </div>
        )}
      </Card>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, empleado: null })}
        title={modal.empleado ? "Editar Empleado" : "Nuevo Empleado"}
      >
        <EmpleadoForm
          empleado={modal.empleado}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={() => setModal({ open: false, empleado: null })}
          loading={loading}
        />
      </Modal>
    </motion.div>
  );
};