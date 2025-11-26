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

  // --- CORRECCIÓN 1: Dependencia de showInactive ---
  // Cada vez que cambiamos entre "Ver Activos" y "Papelera", recargamos la data correcta desde la API.
  useEffect(() => {
    // Si showInactive es true, pedimos is_active=false. Si no, is_active=true.
    fetchProductos({ is_active: !showInactive });
  }, [fetchProductos, showInactive]);

  // 3. Filtrado (Búsqueda local sobre lo que trajo la API)
  const filtered = productos.filter(p => {
    const search = searchTerm.toLowerCase();
    
    // Filtro por texto
    const matchesSearch = 
        p.producto_nombre.toLowerCase().includes(search) ||
        (p.tipo_producto_nombre || '').toLowerCase().includes(search) ||
        (p.marca_nombre || '').toLowerCase().includes(search);

    // NOTA: Ya no necesitamos filtrar por estado aquí estrictamente porque la API
    // ya nos trajo lo correcto, pero lo dejamos como seguridad visual.
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

  // --- CORRECCIÓN 2: Uso de Smart Delete ---
  const handleToggleStatus = async (prod) => {
    if (prod.activo) {
        // CASO: El producto está activo y queremos borrarlo/desactivarlo
        if (await confirm({ 
            title: 'Eliminar Producto', 
            text: `¿Estás seguro de eliminar ${prod.producto_nombre}? Si tiene historial, se archivará automáticamente.`, 
            icon: 'warning',
            confirmButtonText: 'Sí, eliminar'
        })) {
            // Usamos eliminarProducto. El hook decidirá si es 204 (borrar) o 200 (soft delete)
            // y actualizará la lista automáticamente.
            await eliminarProducto(prod.id);
            
            // NO llamamos a fetchProductos() aquí, el hook ya actualizó el estado local.
        }
    } else {
        // CASO: Reactivar desde la papelera
        if (await confirm({ 
            title: 'Reactivar', 
            text: `¿Volver a activar ${prod.producto_nombre} para la venta?`, 
            icon: 'info' 
        })) {
            await toggleEstadoProducto(prod.id, true);
            // El hook actualiza el estado local a activo=true.
            // Como estamos viendo la lista de inactivos, el ítem desaparecerá visualmente (correcto).
        }
    }
  };

  const handleFormClose = () => {
      setModal({ ...modal, open: false });
      // Aquí sí recargamos para asegurar consistencia tras edición/creación
      fetchProductos({ is_active: !showInactive });
  };

  return (
    <motion.div className={styles.contentContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
            <h2 className={styles.sectionTitle}>Catálogo de Productos</h2>
            <p className={styles.subtitle}>
                {showInactive ? 'Papelera de Reciclaje (Productos Inactivos)' : 'Gestión de productos para venta'}
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
            // Añadimos un color distintivo cuando está en modo papelera
            style={showInactive ? { borderColor: 'var(--color-warning)', color: 'var(--color-warning)' } : {}}
        >
            {showInactive ? 'Volver a Activos' : 'Ver Papelera'}
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
                        exit={{ opacity: 0, scale: 0.9 }}
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
                            
                            {/* STOCK STATUS (Solo mostrar si está activo o si queremos verlo en papelera) */}
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
                                    title={p.activo ? "Eliminar" : "Restaurar"}
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
                <h3>{showInactive ? 'La papelera está vacía' : 'No se encontraron productos'}</h3>
                <p>{showInactive ? 'Los productos eliminados aparecerán aquí.' : 'Intenta ajustar los filtros o agrega un nuevo producto.'}</p>
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
                useProductosHook={inventarioHook} 
                mode={modal.mode}
            />
        </Modal>
      )}
    </motion.div>
  );
};