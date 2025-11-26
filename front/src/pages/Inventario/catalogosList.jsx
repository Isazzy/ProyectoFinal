import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, Tag, Bookmark, Layers, AlertCircle, RotateCcw } from 'lucide-react';
import { useDependencias } from '../../hooks/useDependencias';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import styles from '../../styles/Inventario.module.css';

// --- SUB-COMPONENTE FORMULARIO ---
const CatalogoForm = ({ initialData, onSubmit, onCancel, label }) => {
    const getInitialName = () => {
      if (label === 'Tipo') return initialData?.tipo_producto_nombre;
      if (label === 'Categoría') return initialData?.categoria_insumo_nombre;
      return initialData?.nombre; 
    };
    const [nombre, setNombre] = useState(getInitialName() || "");
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");
    const isMarca = label === "Marca";

    const handleSubmit = (e) => {
        e.preventDefault();
        let data = {};
        if (label === 'Marca') data = { nombre, descripcion };
        else if (label === 'Tipo') data = { tipo_producto_nombre: nombre };
        else if (label === 'Categoría') data = { categoria_insumo_nombre: nombre };
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formStack}>
            <Input label={`Nombre de ${label} *`} value={nombre} onChange={e => setNombre(e.target.value)} required autoFocus icon={label === 'Marca' ? Bookmark : (label === 'Tipo' ? Tag : Layers)} />
            {isMarca && (
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Descripción</label>
                    <textarea className={styles.textarea} value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} />
                </div>
            )}
            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" icon={Save}>{initialData ? 'Guardar Cambios' : 'Crear'}</Button>
            </div>
        </form>
    );
};

// --- SUB-COMPONENTE TABLA ---
const GenericTable = ({ title, icon: Icon, data, type, onEdit, onToggleStatus, onAdd }) => (
    <Card className={styles.catalogCard}>
        <div className={styles.catalogHeader}>
            <div className={styles.headerTitle}>
                <div className={styles.iconBox}><Icon size={20} /></div>
                <h3>{title}</h3>
            </div>
            <Button size="sm" icon={Plus} onClick={onAdd} variant="outline">Nuevo</Button>
        </div>
        <div className={styles.tableContainer}>
            {data.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr><th>Nombre</th><th style={{width: '100px'}}>Estado</th><th style={{ textAlign: 'right', width: '100px' }}>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {data.map(item => (
                            <tr key={item.id} className={!item.activo ? styles.rowInactive : ''}>
                                <td className={styles.nameCell}>
                                    {item.nombre || item.tipo_producto_nombre || item.categoria_insumo_nombre}
                                    {item.descripcion && <span className={styles.descSmall}>{item.descripcion}</span>}
                                </td>
                                <td><Badge variant={item.activo ? 'success' : 'secondary'} size="sm">{item.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                                <td className={styles.actions}>
                                    {/* Solo editar si está activo */}
                                    {item.activo && (
                                        <button className={styles.actionBtn} onClick={() => onEdit(item, type)} title="Editar"><Edit size={16} /></button>
                                    )}
                                    {/* Botón Switch: Eliminar vs Reactivar */}
                                    <button 
                                        className={`${styles.actionBtn} ${item.activo ? styles.btnDelete : styles.btnSuccess}`} 
                                        onClick={() => onToggleStatus(item, type)} 
                                        title={item.activo ? "Eliminar" : "Reactivar"}
                                    >
                                        {item.activo ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className={styles.emptyCatalog}><AlertCircle size={32} /><p>No hay {title.toLowerCase()} registrados.</p></div>
            )}
        </div>
    </Card>
);

// --- COMPONENTE PRINCIPAL ---
export const CatalogosList = () => {
  const { 
      tipos, marcas, categorias, fetchAll, 
      guardarTipo, eliminarTipo, reactivarTipo,
      guardarMarca, eliminarMarca, reactivarMarca,
      guardarCategoria, eliminarCategoria, reactivarCategoria
  } = useDependencias();
  
  const { confirm } = useSwal();
  const [modal, setModal] = useState({ open: false, type: null, item: null });

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (data) => {
    let success = false;
    if (modal.type === 'tipo') success = await guardarTipo(data, modal.item?.id);
    else if (modal.type === 'marca') success = await guardarMarca(data, modal.item?.id);
    else if (modal.type === 'categoria') success = await guardarCategoria(data, modal.item?.id);
    if (success) setModal({ open: false, type: null, item: null });
  };

  const handleToggleStatus = async (item, type) => {
    if (item.activo) {
        // CASO: ELIMINAR / DESACTIVAR
        if (await confirm({ 
            title: '¿Eliminar registro?', 
            text: 'Si está en uso, se desactivará en lugar de borrarse.', 
            icon: 'warning',
            confirmButtonText: 'Sí, eliminar',
            isDanger: true 
        })) {
            if (type === 'tipo') await eliminarTipo(item.id);
            else if (type === 'marca') await eliminarMarca(item.id);
            else if (type === 'categoria') await eliminarCategoria(item.id);
        }
    } else {
        // CASO: REACTIVAR
        if (await confirm({
            title: 'Reactivar',
            text: '¿Desea volver a habilitar este registro?',
            icon: 'info',
            confirmButtonText: 'Sí, activar'
        })) {
            if (type === 'tipo') await reactivarTipo(item.id);
            else if (type === 'marca') await reactivarMarca(item.id);
            else if (type === 'categoria') await reactivarCategoria(item.id);
        }
    }
  };

  const openNewTipo = () => setModal({ open: true, type: 'tipo', item: null });
  const openNewMarca = () => setModal({ open: true, type: 'marca', item: null });
  const openNewCat = () => setModal({ open: true, type: 'categoria', item: null });
  const openEdit = (item, type) => setModal({ open: true, type, item });

  const getLabel = () => {
      if(modal.type === 'tipo') return 'Tipo';
      if(modal.type === 'marca') return 'Marca';
      return 'Categoría';
  };

  return (
    <div className={styles.catalogsGrid}>
      <GenericTable title="Tipos de Producto" icon={Tag} data={tipos} type="tipo" onAdd={openNewTipo} onEdit={openEdit} onToggleStatus={handleToggleStatus} />
      <GenericTable title="Categorías de Insumo" icon={Layers} data={categorias} type="categoria" onAdd={openNewCat} onEdit={openEdit} onToggleStatus={handleToggleStatus} />
      <GenericTable title="Marcas" icon={Bookmark} data={marcas} type="marca" onAdd={openNewMarca} onEdit={openEdit} onToggleStatus={handleToggleStatus} />
      
      {modal.open && (
        <Modal isOpen={true} onClose={() => setModal({ ...modal, open: false })} title={`${modal.item ? 'Editar' : 'Nueva'} ${getLabel()}`}>
            <CatalogoForm initialData={modal.item} label={getLabel()} onSubmit={handleSave} onCancel={() => setModal({ ...modal, open: false })} />
        </Modal>
      )}
    </div>
  );
};