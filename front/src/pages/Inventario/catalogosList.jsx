import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { useDependencias } from '../../hooks/useDependencias';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import styles from '../../styles/Inventario.module.css';

// Sub-componente Formulario Genérico
const CatalogoForm = ({ initialData, onSubmit, onCancel, label }) => {
  const [nombre, setNombre] = useState(initialData?.nombre || initialData?.tipo_producto_nombre || "");
  
  // Detectar si es marca para mostrar campo extra
  const isMarca = label === "Marca";
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = isMarca ? { nombre, descripcion } : { tipo_producto_nombre: nombre };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <Input 
        label={`Nombre de ${label}`} 
        value={nombre} 
        onChange={e => setNombre(e.target.value)} 
        required 
      />
      {isMarca && (
        <div>
            <label style={{fontSize:'0.875rem', fontWeight:500}}>Descripción</label>
            <textarea 
                className={styles.input}
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                style={{width:'100%'}}
            />
        </div>
      )}
      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" icon={Save}>Guardar</Button>
      </div>
    </form>
  );
};

export const CatalogosList = () => {
  const { tipos, marcas, fetchAll, guardarTipo, eliminarTipo, guardarMarca, eliminarMarca } = useDependencias();
  const { confirm } = useSwal();
  
  const [modal, setModal] = useState({ open: false, type: null, item: null });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSave = async (data) => {
    let success = false;
    if (modal.type === 'tipo') {
        success = await guardarTipo(data, modal.item?.id);
    } else {
        success = await guardarMarca(data, modal.item?.id);
    }
    if (success) setModal({ open: false, type: null, item: null });
  };

  const handleDelete = async (item, type) => {
    if (await confirm({ title: 'Eliminar', text: '¿Estás seguro?' })) {
        if (type === 'tipo') await eliminarTipo(item.id);
        else await eliminarMarca(item.id);
    }
  };

  const renderTable = (data, type, labelField) => (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Estado</th>
          <th style={{ textAlign: 'right' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.5 }}>
            <td>{item[labelField]}</td>
            <td><Badge variant={item.activo ? 'success' : 'secondary'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge></td>
            <td className={styles.actions}>
                <div style={{display:'flex', justifyContent:'flex-end', gap:5}}>
                    <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, type, item })}>
                        <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="ghost" className={styles.dangerBtn} onClick={() => handleDelete(item, type)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* COLUMNA TIPOS */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3>Tipos de Producto</h3>
            <Button size="sm" icon={Plus} onClick={() => setModal({ open: true, type: 'tipo', item: null })}>Nuevo</Button>
        </div>
        {renderTable(tipos, 'tipo', 'tipo_producto_nombre')}
      </Card>

      {/* COLUMNA MARCAS */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <h3>Marcas</h3>
            <Button size="sm" icon={Plus} onClick={() => setModal({ open: true, type: 'marca', item: null })}>Nueva</Button>
        </div>
        {renderTable(marcas, 'marca', 'nombre')}
      </Card>

      {/* MODAL COMPARTIDO */}
      <Modal 
        isOpen={modal.open} 
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.type === 'tipo' ? 'Gestionar Tipo' : 'Gestionar Marca'}
      >
        <CatalogoForm 
            initialData={modal.item} 
            label={modal.type === 'tipo' ? 'Tipo' : 'Marca'}
            onSubmit={handleSave}
            onCancel={() => setModal({ ...modal, open: false })}
        />
      </Modal>
    </div>
  );
};