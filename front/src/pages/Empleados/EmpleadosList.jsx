// ========================================
// src/pages/Empleados/EmpleadosList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, User, Trash2, Search, Mail, Phone, Shield, Briefcase } from 'lucide-react';
import { useEmpleados } from '../../hooks/useEmpleados';
import { Card, Button, Badge, Modal, Input } from '../../components/ui';
import styles from '../../styles/Empleados.module.css';

// --- SUB-COMPONENTE: FORMULARIO ---
const EmpleadoForm = ({ empleado, roles, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    first_name: empleado?.first_name || "",
    last_name: empleado?.last_name || "",
    email: empleado?.email || "",
    dni: empleado?.empleado?.dni || "",
    telefono: empleado?.empleado?.telefono || "",
    especialidad: empleado?.empleado?.especialidad || "otro",
    rol: empleado?.empleado?.rol || "", // ID del rol
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
      
      {/* SECCIÓN 1: DATOS PERSONALES */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Información Personal</h3>
        <div className={styles.formRow}>
            <Input label="Nombre *" name="first_name" value={form.first_name} onChange={handleChange} required />
            <Input label="Apellido *" name="last_name" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className={styles.formRow}>
            <Input label="DNI" name="dni" value={form.dni} onChange={handleChange} />
            <div className={styles.selectGroup}>
                <label>Especialidad</label>
                <select name="especialidad" value={form.especialidad} onChange={handleChange} className={styles.select}>
                    <option value="peluquera">Peluquera</option>
                    <option value="manicurista">Manicurista</option>
                    <option value="maquilladora">Maquilladora</option>
                    <option value="otro">Otro</option>
                </select>
            </div>
        </div>
      </div>

      {/* SECCIÓN 2: CONTACTO */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Contacto</h3>
        <div className={styles.formRow}>
            <Input label="Email *" type="email" name="email" value={form.email} onChange={handleChange} required icon={Mail}/>
            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} icon={Phone}/>
        </div>
      </div>

      {/* SECCIÓN 3: ACCESO AL SISTEMA */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Sistema y Rol</h3>
        <div className={styles.formRow}>
            <div className={styles.selectGroup} style={{flex:1}}>
                <label>Rol de Usuario *</label>
                <select name="rol" value={form.rol} onChange={handleChange} required className={styles.select}>
                    <option value="">Seleccione un rol...</option>
                    {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>
            {!isEditMode && (
                <div style={{flex:1}}>
                    <Input label="Nombre de Usuario *" name="username" value={form.username} onChange={handleChange} required placeholder="Ej: juan.perez" />
                </div>
            )}
        </div>

        {!isEditMode && (
             <div className={styles.passwordRow}>
                <Input label="Contraseña *" type="password" name="password" value={form.password} onChange={handleChange} required />
                <p className={styles.hint}>Mínimo 6 caracteres.</p>
             </div>
        )}
      </div>

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{isEditMode ? "Guardar Cambios" : "Crear Empleado"}</Button>
      </div>
    </form>
  );
};

// --- COMPONENTE PRINCIPAL ---
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

  const filteredEmpleados = empleados.filter(e => {
    const term = search.toLowerCase();
    const fullName = `${e.first_name} ${e.last_name}`.toLowerCase();
    const email = (e.email || "").toLowerCase();
    return fullName.includes(term) || email.includes(term);
  });

  const handleSubmit = async (data) => {
    let success = false;
    if (modal.empleado) {
      const idParaActualizar = modal.empleado.empleado?.id;
      if (idParaActualizar) {
          success = await actualizarEmpleado(idParaActualizar, data);
      }
    } else {
      success = await crearEmpleado(data);
    }
    
    if (success) setModal({ open: false, empleado: null });
  };

  const handleDelete = async (empleado) => {
    await eliminarEmpleado(empleado.id, `${empleado.first_name} ${empleado.last_name}`);
  };

  // Helper para iniciales
  const getInitials = (name, last) => `${name?.[0]||''}${last?.[0]||''}`.toUpperCase();

  // Helper para color de rol
  const getRoleVariant = (rolName) => {
      const r = (rolName || '').toLowerCase();
      if (r === 'administrador') return 'primary'; // Violeta
      if (r === 'empleado') return 'info'; // Azul
      return 'secondary'; // Gris
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pageContainer}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
            <h1 className={styles.title}>Equipo</h1>
            <p className={styles.subtitle}>Gestión de personal y accesos</p>
        </div>
        <Button icon={Plus} onClick={() => setModal({ open: true, empleado: null })}>
          Nuevo Colaborador
        </Button>
      </header>

      {/* FILTROS */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
            <Input 
                placeholder="Buscar por nombre o email..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                icon={Search}
            />
        </div>
      </div>

      {/* GRID DE TARJETAS */}
      {loading && empleados.length === 0 ? (
          <div className={styles.loadingState}>Cargando equipo...</div>
      ) : (
          filteredEmpleados.length > 0 ? (
            <div className={styles.grid}>
                {filteredEmpleados.map(emp => (
                    <motion.div 
                        key={emp.id} 
                        className={`${styles.card} ${!emp.is_active ? styles.inactive : ''}`}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.avatar}>
                                {getInitials(emp.first_name, emp.last_name)}
                            </div>
                            <div className={styles.headerInfo}>
                                <h3>{emp.first_name} {emp.last_name}</h3>
                                <span className={styles.username}>@{emp.username}</span>
                            </div>
                            {/* Badge de Rol */}
                            <div className={styles.roleBadge}>
                                <Badge variant={getRoleVariant(emp.rol)} size="sm">
                                    {emp.rol || 'Sin Rol'}
                                </Badge>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <Briefcase size={16} className={styles.icon} />
                                <span>{emp.empleado?.especialidad || 'General'}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <Mail size={16} className={styles.icon} />
                                <span className={styles.emailText} title={emp.email}>{emp.email}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <Phone size={16} className={styles.icon} />
                                <span>{emp.empleado?.telefono || '-'}</span>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <div className={styles.statusIndicator}>
                                <span className={`${styles.dot} ${emp.is_active ? styles.online : styles.offline}`}></span>
                                {emp.is_active ? 'Activo' : 'Inactivo'}
                            </div>
                            <div className={styles.actions}>
                                <Button size="sm" variant="ghost" icon={Edit} onClick={() => setModal({ open: true, empleado: emp })}/>
                                <Button size="sm" variant="ghost" className={styles.dangerBtn} icon={Trash2} onClick={() => handleDelete(emp)}/>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
                <User size={48} />
                <p>No se encontraron empleados.</p>
            </div>
          )
      )}

      {/* MODAL */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, empleado: null })}
        title={modal.empleado ? "Editar Colaborador" : "Alta de Colaborador"}
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