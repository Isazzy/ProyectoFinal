import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, ShoppingBag, RefreshCw, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useProductos } from '../../hooks/useProductos';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge } from '../../components/ui/index';
import { ProductoForm } from './ProductoForm';
import styles from '../../styles/Inventario.module.css';

export const ProductosList = () => {
  // Hook principal
  const inventarioHook = useProductos();
  const { productos, loading, fetchProductos, eliminarProducto, toggleEstadoProducto } = inventarioHook;
  const { confirm, showSuccess } = useSwal();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false); 
  
  // Estado del Modal
  const [modal, setModal] = useState({
      open: false,
      mode: 'crear', // 'crear' | 'editar' | 'ver'
      producto: null
  });

  useEffect(() => {
    fetchProductos(); 
  }, [fetchProductos]);

  // Filtrado
  const filtered = productos.filter(p => {
    const matchesSearch = p.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive ? !p.activo : p.activo; 
    return matchesSearch && matchesStatus;
  });

  // -- MANEJADORES --

  const handleOpenCreate = () => {
    setModal({ open: true, mode: 'crear', producto: null });
  };

  const handleOpenEdit = (prod) => {
    setModal({ open: true, mode: 'editar', producto: prod });
  };

  const handleOpenView = (prod) => {
    setModal({ open: true, mode: 'ver', producto: prod });
  };

  // Maneja tanto BORRAR como REACTIVAR
  const handleToggleStatus = async (prod) => {
    if (prod.activo) {
        // Si está activo, lo borramos (soft delete)
        if (await confirm({ 
            title: 'Desactivar Producto', 
            text: `¿Mover ${prod.producto_nombre} a inactivos?`, 
            icon: 'warning' 
        })) {
            // Usamos la nueva función que usa PATCH
            await toggleEstadoProducto(prod.id, false);
            // Opcional: si quieres refrescar desde el server
            // fetchProductos(); 
        }
    } else {
        // Si está inactivo, preguntamos si reactivar
        if (await confirm({ 
            title: 'Reactivar', 
            text: `¿Volver a activar ${prod.producto_nombre}?`, 
            icon: 'info' 
        })) {
            // Usamos la nueva función que usa PATCH
            await toggleEstadoProducto(prod.id, true);
            // fetchProductos();
        }
    }
  };

  const handleFormClose = () => {
      setModal({ ...modal, open: false });
      fetchProductos();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header} style={{marginBottom: 20, display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h1 className={styles.title}>Productos</h1>
            <p style={{color: '#666', fontSize: '0.9rem'}}>
                {showInactive ? 'Viendo productos desactivados' : 'Gestión del catálogo de venta'}
            </p>
        </div>
        {!showInactive && (
            <Button icon={Plus} onClick={handleOpenCreate}>Nuevo Producto</Button>
        )}
      </header>

      {/* FILTROS */}
      <div className={styles.filters} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <div style={{flex: 1}}>
            <Input icon={Search} placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button 
            variant={showInactive ? "secondary" : "outline"} 
            onClick={() => setShowInactive(!showInactive)}
            icon={showInactive ? Eye : EyeOff}
        >
            {showInactive ? 'Ver Activos' : 'Inactivos'}
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className={styles.loading} style={{ display: 'flex', justifyContent:'center', padding: 40 }}>
           <RefreshCw className="animate-spin" size={30} color="#2563eb"/> 
        </div>
      )}

      {/* GRID DE CARDS */}
      {!loading && filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(p => {
                const stock = parseFloat(p.stock || 0);
                const min = parseFloat(p.stock_minimo || 0);
                const esCritico = stock <= min && stock > 0;
                const agotado = stock === 0;

                return (
                    <motion.div 
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                            border: '1px solid #f0f0f0',
                            position: 'relative',
                            opacity: p.activo ? 1 : 0.8 // Un poco más opaco si es inactivo
                        }}
                    >
                        {/* IMAGEN */}
                        <div style={{ height: 160, background: '#f9fafb', position: 'relative', cursor: 'pointer' }} onClick={() => handleOpenView(p)}>
                            {p.producto_imagen_url ? (
                                <img src={p.producto_imagen_url} alt={p.producto_nombre} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#cbd5e1'}}>
                                    <ShoppingBag size={48} strokeWidth={1} />
                                </div>
                            )}
                            <div style={{
                                position: 'absolute', top: 10, right: 10, 
                                background: 'rgba(255,255,255,0.95)', padding: '4px 10px', 
                                borderRadius: 20, fontWeight: 'bold', fontSize: '0.9rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                ${parseFloat(p.producto_precio).toFixed(2)}
                            </div>
                        </div>

                        {/* CONTENIDO */}
                        <div style={{ padding: 15 }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 5}}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#1f2937' }}>{p.producto_nombre}</h3>
                            </div>
                            
                            <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                                <Badge variant="outline" size="sm">{p.tipo_producto_nombre || 'General'}</Badge>
                                {p.marca_nombre && <Badge variant="secondary" size="sm">{p.marca_nombre}</Badge>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, marginBottom: 15 }}>
                                <div style={{fontSize: '0.85rem', color: '#64748b'}}>Stock: <strong>{stock}</strong></div>
                                <div>
                                    {agotado ? (
                                        <span style={{color: '#ef4444', fontWeight: 600, fontSize: '0.8rem'}}>● Agotado</span>
                                    ) : esCritico ? (
                                        <span style={{color: '#f59e0b', fontWeight: 600, fontSize: '0.8rem'}}>● Bajo Stock</span>
                                    ) : (
                                        <span style={{color: '#10b981', fontWeight: 600, fontSize: '0.8rem'}}>● En Stock</span>
                                    )}
                                </div>
                            </div>

                            {/* ACCIONES */}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button variant="outline" size="sm" style={{flex: 1}} onClick={() => handleOpenView(p)}>
                                    <Eye size={16} style={{marginRight:5}}/> Ver
                                </Button>
                                
                                {/* Solo permitimos editar si está activo (opcional, pero recomendado) */}
                                {p.activo && (
                                    <Button variant="primary" size="sm" style={{flex: 1}} onClick={() => handleOpenEdit(p)}>
                                        <Edit size={16} style={{marginRight:5}}/> Editar
                                    </Button>
                                )}

                                <button 
                                    onClick={() => handleToggleStatus(p)}
                                    style={{
                                        background: p.activo ? '#fee2e2' : '#dcfce7', 
                                        color: p.activo ? '#ef4444' : '#16a34a', 
                                        border: 'none', 
                                        borderRadius: 6, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    title={p.activo ? "Desactivar" : "Reactivar"}
                                >
                                    {p.activo ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
      ) : (
        !loading && (
            <div className={styles.emptyState} style={{textAlign:'center', padding: 40, color: '#94a3b8'}}>
                <ShoppingBag size={48} style={{marginBottom: 10, opacity: 0.5}} />
                <p>{showInactive ? 'No hay productos inactivos.' : 'No hay productos registrados.'}</p>
            </div>
        )
      )}

      {/* MODAL FORM */}
      {modal.open && (
        <ProductoForm 
            productoToEdit={modal.producto} 
            mode={modal.mode} // Pasamos el modo (ver, editar, crear)
            onClose={handleFormClose} 
            useProductosHook={inventarioHook} 
        />
      )}
    </motion.div>
  );
};