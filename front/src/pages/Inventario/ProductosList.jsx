// ========================================
// src/pages/Inventario/ProductosList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Search, Edit, Trash2, ShoppingBag, 
    RefreshCw, Eye, EyeOff, RotateCcw, Tag, AlertTriangle 
} from 'lucide-react';
import { useProductos } from '../../hooks/useProductos';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input, Badge, Modal } from '../../components/ui';
import { ProductoForm } from './ProductoForm';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Inventario.module.css';

export const ProductosList = () => {
  // 1. Hook Principal
  const inventarioHook = useProductos();
  const { productos, loading, fetchProductos, eliminarProducto, toggleEstadoProducto } = inventarioHook;
  const { confirm } = useSwal();

  // 2. Estados Locales
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false); 
  
  const [modal, setModal] = useState({
      open: false,
      mode: 'crear', // 'crear' | 'editar' | 'ver'
      producto: null
  });

  useEffect(() => {
    fetchProductos(); 
  }, [fetchProductos]);

  // 3. Filtrado
  const filtered = productos.filter(p => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
        p.producto_nombre.toLowerCase().includes(search) ||
        (p.tipo_producto_nombre || '').toLowerCase().includes(search) ||
        (p.marca_nombre || '').toLowerCase().includes(search);

    // Lógica de estado: Si showInactive es true, mostramos los inactivos. Si es false, los activos.
    const matchesStatus = showInactive ? !p.activo : p.activo; 
    
    return matchesSearch && matchesStatus;
  });

  // -- HANDLERS --

  const handleOpenCreate = () => {
    setModal({ open: true, mode: 'crear', producto: null });
  };

  const handleOpenEdit = (prod) => {
    setModal({ open: true, mode: 'editar', producto: prod });
  };

  const handleOpenView = (prod) => {
    setModal({ open: true, mode: 'ver', producto: prod });
  };

  const handleToggleStatus = async (prod) => {
    if (prod.activo) {
        // Soft Delete (Desactivar)
        if (await confirm({ 
            title: 'Desactivar Producto', 
            text: `¿Mover ${prod.producto_nombre} a inactivos?`, 
            icon: 'warning' 
        })) {
            // Si tienes la función toggle en el hook, úsala. Si no, usa eliminar (si el backend hace soft delete en delete)
            if (toggleEstadoProducto) await toggleEstadoProducto(prod.id, false);
            else await eliminarProducto(prod.id);
            
            fetchProductos(); 
        }
    } else {
        // Reactivar
        if (await confirm({ 
            title: 'Reactivar', 
            text: `¿Volver a activar ${prod.producto_nombre}?`, 
            icon: 'info' 
        })) {
            if (toggleEstadoProducto) await toggleEstadoProducto(prod.id, true);
            fetchProductos();
        }
    }
  };

  const handleFormClose = () => {
      setModal({ ...modal, open: false });
      fetchProductos();
  };

  return (
    <motion.div className={styles.contentContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
            <h2 className={styles.sectionTitle}>Catálogo de Productos</h2>
            <p className={styles.subtitle}>
                {showInactive ? 'Viendo productos desactivados' : 'Gestión de productos para venta'}
            </p>
        </div>
        {!showInactive && (
            <Button icon={Plus} onClick={handleOpenCreate}>Nuevo Producto</Button>
        )}
      </header>

      {/* BARRA DE FILTROS */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
            <Input 
                icon={Search} 
                placeholder="Buscar por nombre, marca o tipo..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
            />
        </div>
        <Button 
            variant={showInactive ? "secondary" : "outline"} 
            onClick={() => setShowInactive(!showInactive)}
            icon={showInactive ? Eye : EyeOff}
        >
            {showInactive ? 'Ver Activos' : 'Papelera'}
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className={styles.loading}>
           <RefreshCw className="animate-spin" size={30} color="#9B8DC5"/> 
           <p>Cargando catálogo...</p>
        </div>
      )}

      {/* GRID DE PRODUCTOS */}
      {!loading && filtered.length > 0 ? (
        <div className={styles.grid}>
            {filtered.map(p => {
                // Lógica de Stock
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
                        className={`${styles.cardItem} ${!p.activo ? styles.inactiveCard : ''}`}
                    >
                        {/* IMAGEN + PRECIO */}
                        <div className={styles.cardImageWrapper} onClick={() => handleOpenView(p)}>
                            {p.producto_imagen_url ? (
                                <img src={p.producto_imagen_url} alt={p.producto_nombre} className={styles.cardImage} />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <ShoppingBag size={40} strokeWidth={1.5} />
                                </div>
                            )}
                            
                            {/* Badge de Precio */}
                            <div className={styles.priceBadge}>
                                {formatCurrency(p.producto_precio)}
                            </div>
                        </div>

                        {/* CONTENIDO */}
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderInfo}>
                                <h3 className={styles.productName} title={p.producto_nombre}>{p.producto_nombre}</h3>
                                <div className={styles.tags}>
                                    <Badge variant="outline" size="sm">{p.tipo_producto_nombre || 'General'}</Badge>
                                    {p.marca_nombre && <span className={styles.brandTag}>{p.marca_nombre}</span>}
                                </div>
                            </div>
                            
                            {/* STOCK STATUS */}
                            <div className={`${styles.stockBar} ${agotado ? styles.stockNone : esCritico ? styles.stockLow : styles.stockOk}`}>
                                <div className={styles.stockInfo}>
                                    {agotado ? <AlertTriangle size={14}/> : <Tag size={14}/>}
                                    <span>Stock: <strong>{stock}</strong></span>
                                </div>
                                <span className={styles.stockStatusLabel}>
                                    {agotado ? 'Agotado' : esCritico ? 'Bajo' : 'Disponible'}
                                </span>
                            </div>

                            {/* ACCIONES */}
                            <div className={styles.cardActions}>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenView(p)} title="Ver Detalle">
                                    <Eye size={18}/>
                                </Button>
                                
                                {p.activo && (
                                    <>
                                        <div className={styles.dividerVertical}></div>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)} title="Editar">
                                            <Edit size={18}/>
                                        </Button>
                                    </>
                                )}

                                <button 
                                    className={`${styles.iconBtn} ${p.activo ? styles.btnDanger : styles.btnSuccess}`}
                                    onClick={() => handleToggleStatus(p)}
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
            <div className={styles.emptyState}>
                <ShoppingBag size={48} strokeWidth={1} />
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o agrega un nuevo producto al inventario.</p>
            </div>
        )
      )}

      {/* MODAL FORM */}
      {modal.open && (
        <Modal 
            isOpen={true} 
            onClose={handleFormClose}
            title={modal.mode === 'crear' ? 'Nuevo Producto' : modal.mode === 'editar' ? 'Editar Producto' : 'Detalle del Producto'}
        >
            <ProductoForm 
                productoToEdit={modal.producto} 
                onClose={handleFormClose} 
                // Pasamos la instancia existente, no la creamos de nuevo
                useProductosHook={inventarioHook} 
                mode={modal.mode}
            />
        </Modal>
      )}
    </motion.div>
  );
};