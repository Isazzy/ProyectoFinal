// ========================================
// src/pages/Compras/ProveedorCrud.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, User, Phone, Save } from 'lucide-react';
import { useCompras } from '../../hooks/useCompras';
import { Card, Button, Input, Modal } from '../../components/ui';
import styles from '../../styles/Compras.module.css';

// Sub-componente Formulario
const ProveedorForm = ({ initialData, onSubmit, onCancel }) => {
    const [form, setForm] = useState({
        proveedor_nombre: initialData?.proveedor_nombre || '',
        proveedor_dni: initialData?.proveedor_dni || '',
        proveedor_telefono: initialData?.proveedor_telefono || '',
        proveedor_email: initialData?.proveedor_email || '',
        proveedor_direccion: initialData?.proveedor_direccion || '',
    });

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form, initialData?.id);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formGrid}>
            <Input label="Nombre *" name="proveedor_nombre" value={form.proveedor_nombre} onChange={handleChange} required />
            <Input label="DNI/CUIT" name="proveedor_dni" value={form.proveedor_dni} onChange={handleChange} />
            <Input label="Teléfono" name="proveedor_telefono" value={form.proveedor_telefono} onChange={handleChange} />
            <Input label="Email" name="proveedor_email" type="email" value={form.proveedor_email} onChange={handleChange} />
            <Input label="Dirección" name="proveedor_direccion" value={form.proveedor_direccion} onChange={handleChange} style={{gridColumn: '1 / -1'}}/>
            
            <div className={styles.formActions}>
                <Button type="submit" icon={Save}>{initialData ? 'Guardar Cambios' : 'Crear Proveedor'}</Button>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
            </div>
        </form>
    );
};


export const ProveedorCrud = () => {
    const { proveedores, loading, fetchProveedores, guardarProveedor, eliminarProveedor } = useCompras();
    const [modal, setModal] = useState({ open: false, data: null });

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);
    
    const handleModalSubmit = (formData, id) => {
        guardarProveedor(formData, id).then(success => {
            if(success) setModal({open: false, data: null});
        });
    };

    return (
        <div>
            <header className={styles.crudHeader}>
                <h2>Gestión de Proveedores</h2>
                <Button icon={Plus} onClick={() => setModal({open: true, data: null})}>Nuevo Proveedor</Button>
            </header>
            
            <Card>
                {loading ? <p>Cargando proveedores...</p> : proveedores.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th style={{textAlign: 'right'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedores.map(p => (
                                <tr key={p.id}>
                                    <td><User size={16} style={{marginRight: 8}}/>{p.proveedor_nombre}</td>
                                    <td>{p.proveedor_telefono || '-'}</td>
                                    <td>{p.proveedor_email || '-'}</td>
                                    <td style={{textAlign: 'right'}}>
                                        <Button size="sm" variant="ghost" onClick={() => setModal({open: true, data: p})}><Edit size={16}/></Button>
                                        <Button size="sm" variant="ghost" onClick={() => eliminarProveedor(p.id)}><Trash2 size={16}/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No hay proveedores registrados.</p>}
            </Card>

            <Modal isOpen={modal.open} onClose={() => setModal({open: false, data: null})} title={modal.data ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
                <ProveedorForm 
                    initialData={modal.data} 
                    onSubmit={handleModalSubmit}
                    onCancel={() => setModal({open: false, data: null})}
                />
            </Modal>
        </div>
    );
};