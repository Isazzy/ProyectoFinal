// ========================================
// src/pages/Clientes/ClientesList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Users, Phone, Mail, Trash2, Search, User } from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { Card, Button, Input, Modal } from '../../components/ui';
import styles from '../../styles/Clientes.module.css';

// --- COMPONENTE: Formulario ---
const ClienteForm = ({ cliente, onSubmit, onCancel, loading }) => {
  const isEditMode = !!cliente;

  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    apellido: cliente?.apellido || "",
    email: cliente?.email || "",
    telefono: cliente?.telefono || "",
    password: "",
  });

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
        <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} required />
        <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
      </div>

      <div className={styles.formRow}>
        <Input label="Email *" type="email" name="email" value={form.email} onChange={handleChange} required />
        <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
      </div>

      {!isEditMode && (
        <>
          <hr className={styles.divider} />
          <div>
             <h4 className={styles.securityTitle}>Seguridad</h4>
             <Input 
                label="Contraseña de Acceso *" 
                type="password" 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                required 
                placeholder="Mínimo 6 caracteres"
             />
          </div>
        </>
      )}

      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading}>
          {isEditMode ? "Guardar Cambios" : "Registrar Cliente"}
        </Button>
      </div>
    </form>
  );
};

// --- COMPONENTE PRINCIPAL ---
export const ClientesList = () => {
  const { 
    clientes, loading, fetchClientes, 
    crearCliente, actualizarCliente, eliminarCliente 
  } = useClientes();

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, cliente: null });

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // Filtrado
  const filteredClientes = clientes.filter(c => {
    const term = search.toLowerCase();
    const nombreCompleto = `${c.nombre} ${c.apellido}`.toLowerCase();
    const email = (c.email || "").toLowerCase();
    return nombreCompleto.includes(term) || email.includes(term);
  });

  const handleSubmit = async (data) => {
    let success;
    if (modal.cliente) {
      success = await actualizarCliente(modal.cliente.id, data);
    } else {
      success = await crearCliente(data);
    }
    if (success) setModal({ open: false, cliente: null });
  };

  const handleDelete = async (cliente) => {
    await eliminarCliente(cliente.id, `${cliente.nombre} ${cliente.apellido}`);
  };

  // Helper para iniciales
  const getInitials = (nombre, apellido) => {
      return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pageContainer}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <h1 className={styles.title}>Clientes</h1>
        <Button icon={Plus} onClick={() => setModal({ open: true, cliente: null })}>
          Nuevo Cliente
        </Button>
      </header>

      {/* BARRA DE BÚSQUEDA */}
      <div className={styles.filters}>
        <Input
          icon={Search}
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* GRID DE CLIENTES */}
      {loading && clientes.length === 0 ? (
        <div className={styles.loading}>Cargando base de datos...</div>
      ) : filteredClientes.length > 0 ? (
        <div className={styles.clientesGrid}>
          {filteredClientes.map(cliente => (
            <motion.div
              key={cliente.id}
              className={styles.clienteCard}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
            >
              {/* Header Tarjeta */}
              <div className={styles.clienteHeader}>
                <div className={styles.avatar}>
                  {getInitials(cliente.nombre, cliente.apellido)}
                </div>
                <div className={styles.clienteInfo}>
                  <h3>{cliente.nombre} {cliente.apellido}</h3>
                  {/* Rol o Etiqueta opcional si tuvieras tipos de cliente */}
                </div>
              </div>

              {/* Datos de Contacto */}
              <div className={styles.contactData}>
                <div className={styles.dataRow}>
                    <Mail size={16} />
                    <span>{cliente.email || 'Sin email'}</span>
                </div>
                <div className={styles.dataRow}>
                    <Phone size={16} />
                    <span>{cliente.telefono || 'Sin teléfono'}</span>
                </div>
              </div>

              {/* Footer: Stats y Acciones */}
              <div className={styles.cardFooter}>
                <span className={styles.statsBadge}>
                   {/* Campo ficticio 'turnos_count', el backend debería enviarlo con un annotate() */}
                   {cliente.turnos_count || 0} Turnos
                </span>
                
                <div className={styles.actions}>
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => setModal({ open: true, cliente })} title="Editar" />
                  <Button size="sm" variant="ghost" className={styles.dangerBtn} icon={Trash2} onClick={() => handleDelete(cliente)} title="Eliminar" />
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users size={48} />
          <p>No se encontraron clientes.</p>
        </div>
      )}

      {/* MODAL */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, cliente: null })}
        title={modal.cliente ? "Editar Cliente" : "Registrar Nuevo Cliente"}
      >
        <ClienteForm 
          cliente={modal.cliente} 
          onSubmit={handleSubmit} 
          onCancel={() => setModal({ open: false, cliente: null })}
          loading={loading}
        />
      </Modal>

    </motion.div>
  );
};