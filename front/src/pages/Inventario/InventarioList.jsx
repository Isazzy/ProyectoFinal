// ========================================
// src/pages/Inventario/InventarioList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, EyeOff, RotateCcw, Package, AlertTriangle, Tag, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useInventario } from '../../hooks/useInventario';
import { inventarioApi } from '../../api/inventarioApi';
import { useSwal } from '../../hooks/useSwal';
// CORRECCIÓN: Importar Modal
import { Button, Input, Badge, Modal } from '../../components/ui';
import { InsumoForm } from '../../components/forms/InsumoForm'; // Asegúrate que la ruta sea correcta (./InsumoForm o ../../components/forms/InsumoForm)
import styles from '../../styles/Inventario.module.css';
import { formatCurrency } from '../../utils/formatters'; // Si lo necesitas para mostrar precios/valores

export const InventarioList = () => {
  const inventarioHook = useInventario();
  const { insumos, loading, fetchInsumos, eliminarInsumo, toggleEstadoInsumo } = inventarioHook;
  const { prompt, confirm, showSuccess, showError } = useSwal();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  
  const [modal, setModal] = useState({
      open: false,
      mode: 'crear', // 'crear' | 'editar' | 'ver'
      insumo: null
  });

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  const filtered = insumos.filter(insumo => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
        insumo.insumo_nombre.toLowerCase().includes(search) ||
        (insumo.categoria_insumo && insumo.categoria_insumo.toString().toLowerCase().includes(search));
    
    const matchesStatus = showInactive ? !insumo.activo : insumo.activo;
    return matchesSearch && matchesStatus;
  });

  // -- HANDLERS --
  const handleOpenCreate = () => setModal({ open: true, mode: 'crear', insumo: null });
  const handleOpenEdit = (ins) => setModal({ open: true, mode: 'editar', insumo: ins });
  const handleOpenView = (ins) => setModal({ open: true, mode: 'ver', insumo: ins });

  const handleToggleStatus = async (insumo) => {
    if (insumo.activo) {
        if (await confirm({ 
            title: '¿Eliminar Insumo?', 
            text: 'Si no tiene registros, se borrará permanentemente. Si tiene registros, deberá desactivarlo.',
            isDanger: true 
        })) {
            const eliminado = await eliminarInsumo(insumo.id);
            if (!eliminado) {
                if (await confirm({ title: 'Desactivar', text: 'No se puede borrar porque tiene historial. ¿Desea desactivarlo?' })) {
                    await toggleEstadoInsumo(insumo.id, false);
                }
            }
        }
    } else {
        if (await confirm({ title: 'Reactivar', text: `¿Volver a activar ${insumo.insumo_nombre}?`, icon: 'info' })) {
            await toggleEstadoInsumo(insumo.id, true);
        }
    }
  };

  const handleReponer = async (insumo) => {
    const cantidad = await prompt({
      title: `Reponer ${insumo.insumo_nombre}`,
      text: `Stock actual: ${parseFloat(insumo.insumo_stock)} ${insumo.insumo_unidad}`,
      inputType: 'number',
      inputPlaceholder: 'Cantidad a agregar',
    });

    if (cantidad && !isNaN(cantidad) && parseFloat(cantidad) > 0) {
      try {
        await inventarioApi.actualizarStock(insumo.id, parseFloat(cantidad), 'ingreso');
        showSuccess('Stock actualizado');
        fetchInsumos(); 
      } catch (error) {
        showError('Error', 'No se pudo actualizar el stock.');
      }
    }
  };

  const handleFormClose = () => {
      setModal({ ...modal, open: false });
      fetchInsumos();
  };

  // Título dinámico del modal
  const getModalTitle = () => {
      if (modal.mode === 'crear') return 'Nuevo Insumo';
      if (modal.mode === 'editar') return 'Editar Insumo';
      return 'Detalle del Insumo';
  };

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      <header className={styles.header}>
        <div>
            <h2 className={styles.sectionTitle}>Insumos</h2>
            <p className={styles.subtitle}>
                {showInactive ? 'Papelera de Insumos' : 'Gestión de inventario interno'}
            </p>
        </div>
        {!showInactive && <Button icon={Plus} onClick={handleOpenCreate}>Nuevo Insumo</Button>}
      </header>

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
            <Input icon={Search} placeholder="Buscar insumo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button 
            variant={showInactive ? "secondary" : "outline"} 
            onClick={() => setShowInactive(!showInactive)}
            icon={showInactive ? Eye : EyeOff}
        >
            {showInactive ? 'Ver Activos' : 'Papelera'}
        </Button>
      </div>

      {loading && (
        <div className={styles.loading}>
           <RefreshCw className="animate-spin" size={30} color="#9B8DC5"/> 
           <p>Cargando inventario...</p>
        </div>
      )}

      {!loading && filtered.length > 0 ? (
        <div className={styles.grid}>
            {filtered.map(insumo => {
                const stock = parseFloat(insumo.insumo_stock);
                const min = parseFloat(insumo.insumo_stock_minimo);
                const critico = stock <= min;
                const agotado = stock === 0;

                return (
                    <motion.div 
                        key={insumo.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${styles.cardItem} ${!insumo.activo ? styles.inactiveCard : ''}`}
                    >
                        <div className={styles.cardImageWrapper} onClick={() => handleOpenView(insumo)}>
                            {insumo.insumo_imagen_url ? (
                                <img src={insumo.insumo_imagen_url} alt="" className={styles.cardImage} />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <Package size={40} strokeWidth={1.5} />
                                </div>
                            )}
                            <span style={{
                                position: 'absolute', top: 10, left: 10, 
                                background: 'rgba(0,0,0,0.6)', color: '#fff', 
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500
                            }}>
                                {insumo.categoria_insumo || 'General'}
                            </span>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderInfo}>
                                <h3 className={styles.productName}>{insumo.insumo_nombre}</h3>
                                <div className={styles.tags}>
                                    <span className={styles.brandTag}>{insumo.marca || 'N/A'}</span>
                                </div>
                            </div>

                            <div className={`${styles.stockBar} ${agotado ? styles.stockNone : critico ? styles.stockLow : styles.stockOk}`}>
                                <div className={styles.stockInfo}>
                                    {critico ? <AlertTriangle size={14}/> : <Tag size={14}/>}
                                    <span>Stock: <strong>{stock} {insumo.insumo_unidad}</strong></span>
                                </div>
                                <span className={styles.stockStatusLabel}>
                                    {agotado ? 'Agotado' : critico ? 'Bajo' : 'OK'}
                                </span>
                            </div>

                            <div className={styles.cardActions}>
                                {insumo.activo ? (
                                    <>
                                        <Button size="sm" variant="outline" style={{flex:1, fontSize:'0.8rem'}} onClick={() => handleReponer(insumo)}>
                                            <Plus size={14} /> Reponer
                                        </Button>
                                        <div className={styles.dividerVertical}></div>
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(insumo)}>
                                            <Edit size={18} />
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" style={{flex:1}} onClick={() => handleOpenView(insumo)}>
                                        <Eye size={16} style={{marginRight:5}}/> Ver Detalles
                                    </Button>
                                )}

                                <button 
                                    className={`${styles.iconBtn} ${insumo.activo ? styles.btnDanger : styles.btnSuccess}`}
                                    onClick={() => handleToggleStatus(insumo)}
                                    title={insumo.activo ? "Eliminar / Desactivar" : "Reactivar"}
                                >
                                    {insumo.activo ? <Trash2 size={18} /> : <RotateCcw size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
      ) : (
        !loading && (
            <div className={styles.emptyState}>
                <Package size={48} style={{marginBottom: 10, opacity: 0.5}} />
                <p>{showInactive ? 'No hay insumos inactivos.' : 'No hay insumos registrados.'}</p>
            </div>
        )
      )}

      {/* MODAL FORMULARIO (Aquí estaba el problema: ahora usamos Modal) */}
      {modal.open && (
        <Modal 
            isOpen={true} 
            onClose={handleFormClose} 
            title={getModalTitle()}
        >
            <InsumoForm 
                insumoToEdit={modal.insumo} 
                mode={modal.mode}
                onClose={handleFormClose}
                useInventarioHook={inventarioHook} 
            />
        </Modal>
      )}
    </motion.div>
  );
};