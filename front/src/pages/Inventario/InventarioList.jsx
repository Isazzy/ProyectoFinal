import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Search, Edit, Trash2, RefreshCw, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useInventario } from '../../hooks/useInventario';
import { inventarioApi } from '../../api/inventarioApi';
import { useSwal } from '../../hooks/useSwal';
import { Button, Input, Badge } from '../../components/ui';
import { InsumoForm } from '../../components/forms/InsumoForm';
import styles from '../../styles/Inventario.module.css';

export const InventarioList = () => {
  // Hook principal
  const inventarioHook = useInventario();
  const { insumos, loading, fetchInsumos, eliminarInsumo, toggleEstadoInsumo } = inventarioHook;
  const { prompt, confirm, showSuccess, showError } = useSwal();
  
  // Estados locales
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  
  // Estado del Modal
  const [modal, setModal] = useState({
      open: false,
      mode: 'crear', // 'crear' | 'editar' | 'ver'
      insumo: null
  });

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  // Filtrado
  const filtered = insumos.filter(insumo => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
        insumo.insumo_nombre.toLowerCase().includes(search) ||
        (insumo.categoria_insumo && insumo.categoria_insumo.toString().toLowerCase().includes(search));
    
    // Filtro de estado (Activo / Inactivo)
    const matchesStatus = showInactive ? !insumo.activo : insumo.activo;
    return matchesSearch && matchesStatus;
  });

  // -- HANDLERS --
  const handleOpenCreate = () => {
      setModal({ open: true, mode: 'crear', insumo: null });
  };

  const handleOpenEdit = (ins) => {
      setModal({ open: true, mode: 'editar', insumo: ins });
  };

  const handleOpenView = (ins) => {
      setModal({ open: true, mode: 'ver', insumo: ins });
  };

  const handleToggleStatus = async (insumo) => {
    if (insumo.activo) {
        // Si está activo, lo desactivamos (Soft Delete)
        if (await confirm({ title: 'Desactivar', text: `¿Mover ${insumo.insumo_nombre} a inactivos?` })) {
            // Usamos la función de toggle si existe, o eliminarInsumo si el backend lo maneja así
            if (toggleEstadoInsumo) {
                await toggleEstadoInsumo(insumo.id, false);
            } else {
                await eliminarInsumo(insumo.id);
            }
            fetchInsumos();
        }
    } else {
        // Si está inactivo, lo reactivamos
        if (await confirm({ title: 'Reactivar', text: `¿Volver a activar ${insumo.insumo_nombre}?`, icon: 'info' })) {
            if (toggleEstadoInsumo) {
                await toggleEstadoInsumo(insumo.id, true);
                fetchInsumos();
            } else {
                showError("Error", "Función reactivar no implementada en hook.");
            }
        }
    }
  };

  const handleReponer = async (insumo) => {
    const stockActual = parseFloat(insumo.insumo_stock);
    const cantidad = await prompt({
      title: `Reponer ${insumo.insumo_nombre}`,
      text: `Stock actual: ${stockActual} ${insumo.insumo_unidad}`,
      inputType: 'number',
      inputPlaceholder: 'Cantidad a agregar',
    });

    if (cantidad && !isNaN(cantidad) && parseFloat(cantidad) > 0) {
      try {
        await inventarioApi.actualizarStock(insumo.id, parseFloat(cantidad), 'ingreso');
        showSuccess('Stock actualizado');
        fetchInsumos(); 
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo actualizar el stock.');
      }
    }
  };

  // Callback al cerrar el formulario
  const handleFormClose = () => {
      setModal({ ...modal, open: false });
      fetchInsumos();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header} style={{marginBottom: 20, display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
            <h1 className={styles.title}>Insumos</h1>
            <p style={{color:'#666', fontSize:'0.9rem'}}>
                {showInactive ? 'Papelera de Insumos' : 'Gestión de inventario interno'}
            </p>
        </div>
        {!showInactive && (
            <Button icon={Plus} onClick={handleOpenCreate}>Nuevo Insumo</Button>
        )}
      </header>

      {/* FILTROS */}
      <div className={styles.filters} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <div style={{flex: 1}}>
            <Input icon={Search} placeholder="Buscar insumo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
            {filtered.map(insumo => {
                const stock = parseFloat(insumo.insumo_stock);
                const min = parseFloat(insumo.insumo_stock_minimo);
                const critico = stock <= min;

                return (
                    <motion.div 
                        key={insumo.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            opacity: insumo.activo ? 1 : 0.75,
                            transition: 'transform 0.2s',
                            position: 'relative'
                        }}
                        whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                    >
                        {/* IMAGEN */}
                        <div style={{ height: 140, background: '#f8fafc', position: 'relative', cursor: 'pointer' }} onClick={() => handleOpenView(insumo)}>
                            {insumo.insumo_imagen_url ? (
                                <img src={insumo.insumo_imagen_url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#cbd5e1'}}>
                                    <Package size={40} strokeWidth={1.5} />
                                </div>
                            )}
                            
                            {/* Categoría Badge */}
                            <span style={{
                                position: 'absolute', top: 10, left: 10, 
                                background: 'rgba(0,0,0,0.6)', color: '#fff', 
                                padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500
                            }}>
                                {insumo.categoria_insumo || 'General'}
                            </span>
                        </div>

                        {/* BODY */}
                        <div style={{ padding: 15 }}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                <h3 style={{margin: '0 0 5px 0', fontSize: '1rem', color: '#334155', fontWeight: 600}}>{insumo.insumo_nombre}</h3>
                            </div>
                            <div style={{fontSize: '0.8rem', color: '#64748b', marginBottom: 10}}>
                                Marca: {insumo.marca || 'N/A'}
                            </div>

                            {/* STOCK BAR */}
                            <div style={{background: '#f1f5f9', borderRadius: 6, padding: '8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 15}}>
                                <span style={{fontWeight: 600, color: '#334155'}}>{stock} {insumo.insumo_unidad}</span>
                                {critico ? (
                                    <Badge variant="danger" size="sm">Bajo Stock</Badge>
                                ) : (
                                    <Badge variant="success" size="sm">OK</Badge>
                                )}
                            </div>

                            {/* ACCIONES */}
                            <div style={{display: 'flex', gap: 8}}>
                                {/* Botón Ver/Editar solo si está activo */}
                                {insumo.activo ? (
                                    <>
                                        <Button size="sm" variant="outline" style={{flex:1}} onClick={() => handleReponer(insumo)}>
                                            <Plus size={14} /> Reponer
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(insumo)} title="Editar">
                                            <Edit size={16} />
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" style={{flex:1}} onClick={() => handleOpenView(insumo)}>
                                        <Eye size={16} style={{marginRight:5}}/> Ver Detalles
                                    </Button>
                                )}

                                {/* Botón Activar/Desactivar */}
                                <button 
                                    onClick={() => handleToggleStatus(insumo)}
                                    style={{
                                        background: insumo.activo ? '#fee2e2' : '#dcfce7', 
                                        color: insumo.activo ? '#ef4444' : '#16a34a', 
                                        border: 'none', 
                                        borderRadius: 6, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    title={insumo.activo ? "Desactivar" : "Reactivar"}
                                >
                                    {insumo.activo ? <Trash2 size={16} /> : <RotateCcw size={16} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
      ) : (
        !loading && (
            <div className={styles.emptyState} style={{textAlign:'center', padding: 40, color: '#94a3b8'}}>
                <Package size={48} style={{marginBottom: 10, opacity: 0.5}} />
                <p>{showInactive ? 'No hay insumos inactivos.' : 'No hay insumos registrados.'}</p>
            </div>
        )
      )}

      {/* MODAL FORM */}
      {modal.open && (
        <InsumoForm 
            insumoToEdit={modal.insumo} 
            mode={modal.mode}
            onClose={handleFormClose}
            useInventarioHook={inventarioHook} 
        />
      )}
    </motion.div>
  );
};