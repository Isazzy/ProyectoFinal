// ========================================
// src/pages/Clientes/ClientesList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit, Users, Phone, Mail, Trash2 } from 'lucide-react';
import { useClientes } from '../../hooks/useClientes';
import { Card, Button, Input, Modal } from '../../components/ui';
import styles from '../../styles/Clientes.module.css';

// --- COMPONENTE INTERNO: Formulario de Cliente ---
const ClienteForm = ({ cliente, onSubmit, onCancel, loading }) => {
  const isEditMode = !!cliente;

  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    apellido: cliente?.apellido || "",
    email: cliente?.email || "",
    telefono: cliente?.telefono || "",
    // Solo para creación (registro)
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
        <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
      </div>

      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
      <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />

      {/* Si es modo edición, NO mostramos password (el endpoint de update no lo maneja usualmente) */}
      {!isEditMode && (
        <>
          <hr className={styles.divider} />
          <p className={styles.subtitle}>Seguridad</p>
          <Input 
            label="Contraseña (para acceso al sistema)" 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
        </>
      )}

      <div className={styles.formActions}>
        <Button type="submit" loading={loading}>
          {isEditMode ? "Guardar Cambios" : "Registrar Cliente"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
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

  // Filtrado seguro
  const filteredClientes = clientes.filter(c => {
    const term = search.toLowerCase();
    const nombre = (c.nombre || "").toLowerCase();
    const apellido = (c.apellido || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    return `${nombre} ${apellido}`.includes(term) || email.includes(term);
  });

  const handleSubmit = async (data) => {
    if (modal.cliente) {
      // Edición: PUT /clientes/:id/
      await actualizarCliente(modal.cliente.id, data);
    } else {
      // Creación: POST /register/
      await crearCliente(data);
    }
    setModal({ open: false, cliente: null });
  };

  const handleDelete = async (cliente) => {
    await eliminarCliente(cliente.id, `${cliente.nombre} ${cliente.apellido}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Clientes</h1>
        <Button icon={Plus} onClick={() => setModal({ open: true, cliente: null })}>
          Nuevo Cliente
        </Button>
      </header>

      <div className={styles.filters}>
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <Card>
        {loading && clientes.length === 0 ? (
          <div className={styles.loading}>Cargando...</div>
        ) : filteredClientes.length > 0 ? (
          <div className={styles.clientesGrid}>
            {filteredClientes.map(cliente => (
              <motion.div
                key={cliente.id}
                className={styles.clienteCard}
                whileHover={{ y: -4 }}
              >
                <div className={styles.clienteHeader}>
                  <div className={styles.avatar}>
                    {cliente.nombre?.[0]}{cliente.apellido?.[0] || ""}
                  </div>
                  <div className={styles.clienteInfo}>
                    <h3>{cliente.nombre} {cliente.apellido}</h3>
                    {cliente.email && (
                      <p className={styles.email}>
                        <Mail size={14} /> {cliente.email}
                      </p>
                    )}
                    {cliente.telefono && (
                      <p className={styles.phone}>
                        <Phone size={14} /> {cliente.telefono}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Nota: turnos_count vendrá vacío a menos que lo agregues al serializer backend */}
                <div className={styles.clienteStats}>
                  <span>{cliente.turnos_count || 0} turnos</span>
                </div>

                <div className={styles.clienteActions}>
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => setModal({ open: true, cliente })}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" className={styles.dangerText} icon={Trash2} onClick={() => handleDelete(cliente)}>
                    Eliminar
                  </Button>
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
      </Card>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, cliente: null })}
        title={modal.cliente ? "Editar Cliente" : "Nuevo Cliente"}
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