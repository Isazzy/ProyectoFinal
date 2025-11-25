// ========================================
// src/pages/Compras/CompraForm.jsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, DollarSign, Save, ShoppingCart, X, Tag, Calculator } from 'lucide-react';
import { useCompras } from '../../hooks/useCompras';
import { inventarioApi } from '../../api/inventarioApi'; 
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import styles from '../../styles/Compras.module.css';
import { formatCurrency } from '../../utils/formatters';

// Importamos los formularios para creación rápida
import { InsumoForm } from '../../components/forms/InsumoForm';
import { ProductoForm } from '../Inventario/ProductoForm';
// Importamos Hooks para pasarlos a los formularios hijos
import { useInventario } from '../../hooks/useInventario';
import { useProductos } from '../../hooks/useProductos';

// --- Componente de Fila del Carrito (Sin cambios) ---
const CompraItemRow = ({ item, index, updateItem, removeItem }) => {
    return (
        <div className={styles.itemRow}>
            <div className={styles.itemName}>
                <div style={{fontWeight: 600}}>{item.nombre}</div>
                <div style={{fontSize: '0.75rem', color: '#666', display:'flex', gap: 5}}>
                    {item.tipo === 'insumo' ? <Badge variant="secondary" size="sm">Insumo</Badge> : <Badge variant="info" size="sm">Producto</Badge>}
                    <span>({item.unidad})</span>
                </div>
            </div>
            <Input type="number" value={item.cantidad} onChange={(e) => updateItem(index, 'cantidad', e.target.value)} style={{width: 90}} min="0.01" step="any" title={`Cantidad en ${item.unidad}`}/>
            <Input type="number" value={item.precio} onChange={(e) => updateItem(index, 'precio', e.target.value)} style={{width: 110}} startIcon={DollarSign} min="0" step="0.01" title="Costo Unitario"/>
            <div className={styles.itemTotal}>{formatCurrency(item.cantidad * item.precio)}</div>
            <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn}><X size={16}/></button>
        </div>
    );
};

// --- Componente Principal ---
export const CompraForm = ({ onClose }) => {
    const { proveedores, crearCompra, loading, fetchProveedores } = useCompras();
    
    // Hooks auxiliares para los modales de creación
    const inventarioHook = useInventario();
    const productosHook = useProductos();

    // Estados del Formulario
    const [proveedorId, setProveedorId] = useState('');
    const [metodoPago, setMetodoPago] = useState('efectivo');
    const [detalles, setDetalles] = useState([]); 

    // Estados del Buscador y Selección
    const [searchTerm, setSearchTerm] = useState('');
    const [allItems, setAllItems] = useState([]); 
    const [loadingItems, setLoadingItems] = useState(false);

    // Estados de Agregado
    const [selectedItem, setSelectedItem] = useState(null);
    const [qtyInput, setQtyInput] = useState(1);
    const [unitMode, setUnitMode] = useState('base'); 
    const [priceInput, setPriceInput] = useState(0);

    // Estado para Modales de Creación Rápida
    const [createModal, setCreateModal] = useState({ open: false, type: null }); // type: 'insumo' | 'producto'

    // Función para recargar catálogo
    const cargarCatalogo = useCallback(async () => {
        setLoadingItems(true);
        try {
            const [insumosData, productosData] = await Promise.all([
                inventarioApi.getInsumosParaSelect(),
                inventarioApi.getProductos()
            ]);

            const insumosNorm = (insumosData.results || insumosData).map(i => ({
                id: i.id,
                nombre: i.insumo_nombre,
                unidad: i.insumo_unidad,
                tipo: 'insumo',
                key: `ins-${i.id}`
            }));

            const productosNorm = (productosData.results || productosData).map(p => ({
                id: p.id,
                nombre: p.producto_nombre,
                unidad: 'unid.',
                tipo: 'producto',
                key: `prod-${p.id}`
            }));

            setAllItems([...insumosNorm, ...productosNorm]);
        } catch (error) {
            console.error("Error cargando catálogo:", error);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => {
        fetchProveedores();
        cargarCatalogo();
    }, [fetchProveedores, cargarCatalogo]);

    // Filtrado local
    const filteredItems = allItems.filter(i => 
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6);

    // --- LÓGICA DE UNIDADES ---
    const isConvertible = selectedItem && (['ml', 'g', 'cm3'].includes(selectedItem.unidad.toLowerCase()));
    const getRealQuantity = () => (isConvertible && unitMode === 'kilo') ? parseFloat(qtyInput) * 1000 : parseFloat(qtyInput);

    // --- HANDLERS DEL CARRITO ---
    const handleAddItem = () => {
        if (!selectedItem || qtyInput <= 0) return;

        const newItem = {
            ...selectedItem,
            cantidad: getRealQuantity(),
            precio: parseFloat(priceInput) 
        };

        setDetalles(prev => [...prev, newItem]);
        // Reset
        setSearchTerm('');
        setSelectedItem(null);
        setQtyInput(1);
        setPriceInput(0);
        setUnitMode('base');
    };

    const updateItem = (index, field, value) => {
        const val = value === '' ? 0 : parseFloat(value);
        setDetalles(prev => prev.map((item, i) => i === index ? {...item, [field]: val} : item));
    };
    const removeItem = (index) => setDetalles(prev => prev.filter((_, i) => i !== index));

    // --- HANDLER CREACIÓN RÁPIDA (CORREGIDO) ---
    const handleQuickCreate = (tipo) => {
        // Asignamos la variable 'tipo' a la propiedad 'type'
        setCreateModal({ open: true, type: tipo });
    };

    const handleCreationSuccess = async () => {
        // 1. Cerramos modal
        setCreateModal({ open: false, type: null });
        // 2. Recargamos el catálogo
        await cargarCatalogo();
    };

    // --- SUBMIT ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proveedorId || detalles.length === 0) return;

        const payload = {
            proveedor: proveedorId,
            compra_metodo_pago: metodoPago,
            detalles: detalles.map(d => ({
                insumo_id: d.tipo === 'insumo' ? d.id : null,
                producto_id: d.tipo === 'producto' ? d.id : null,
                detalle_compra_cantidad: d.cantidad,
                detalle_compra_precio_unitario: d.precio
            }))
        };

        const success = await crearCompra(payload);
        if (success) onClose();
    };

    const totalCompra = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <h2><ShoppingCart size={24}/> Registrar Compra</h2>

                {/* 1. Cabecera */}
                <div className={styles.section}>
                    <div className={styles.formRow}>
                        <div className={styles.inputGroup}>
                            <label>Proveedor *</label>
                            <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} className={styles.selectInput} required>
                                <option value="">-- Seleccionar --</option>
                                {proveedores.map(p => <option key={p.id} value={p.id}>{p.proveedor_nombre}</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Pago *</label>
                            <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className={styles.selectInput} required>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Buscador y Agregado */}
                <div className={styles.itemSelector}>
                    <h3>Agregar Ítems</h3>
                    <Input 
                        placeholder="Buscar o crear nuevo..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        icon={Package}
                        disabled={!!selectedItem} 
                    />

                    {/* Lista de Resultados */}
                    {!selectedItem && searchTerm && (
                        <div className={styles.searchResults}>
                            {filteredItems.map(i => (
                                <div key={i.key} onClick={() => {setSelectedItem(i); setSearchTerm(i.nombre);}}>
                                    {i.tipo === 'insumo' ? <Package size={14} /> : <Tag size={14} />}
                                    <span style={{marginLeft: 5}}>{i.nombre}</span>
                                    <span style={{fontSize:'0.8em', color:'#888', marginLeft:5}}>({i.unidad})</span>
                                </div>
                            ))}
                            
                            {/* --- BOTONES DE CREACIÓN RÁPIDA --- */}
                            <div className={styles.createActions}>
                                <div className={styles.createLabel}>¿No está en la lista?</div>
                                <div style={{display:'flex', gap:5}}>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleQuickCreate('insumo')}>
                                        <Plus size={14}/> Crear Insumo
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => handleQuickCreate('producto')}>
                                        <Plus size={14}/> Crear Producto
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Barra de Edición */}
                    {selectedItem && (
                        <div className={styles.selectedItemBar}>
                            <div style={{flex: 1}}>
                                <div style={{fontWeight:600, color: '#2563eb'}}>
                                    {selectedItem.nombre}
                                    <Badge variant={selectedItem.tipo === 'insumo'?'secondary':'info'} size="sm" style={{marginLeft:5}}>{selectedItem.tipo}</Badge>
                                </div>
                                {isConvertible && (
                                    <div style={{display:'flex', alignItems:'center', gap:5, marginTop:5}}>
                                        <Calculator size={14} color="#666"/>
                                        <select 
                                            value={unitMode} 
                                            onChange={e => setUnitMode(e.target.value)}
                                            style={{padding:2, fontSize:'0.8rem', borderRadius:4, border:'1px solid #ccc'}}
                                        >
                                            <option value="base">{selectedItem.unidad}</option>
                                            <option value="kilo">{selectedItem.unidad === 'ml' ? 'Litros (x1000)' : 'Kilos (x1000)'}</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{display:'flex', gap: 10, alignItems:'flex-end'}}>
                                <Input 
                                    type="number" 
                                    label={unitMode === 'kilo' ? (selectedItem.unidad === 'ml' ? 'Litros' : 'Kilos') : 'Cantidad'}
                                    value={qtyInput} 
                                    onChange={e => setQtyInput(parseFloat(e.target.value) || 0)} 
                                    style={{width: 80}}
                                />
                                <Input 
                                    type="number" 
                                    label="Costo Unit."
                                    value={priceInput} 
                                    onChange={e => setPriceInput(parseFloat(e.target.value) || 0)} 
                                    style={{width: 100}}
                                    placeholder="$"
                                />
                                <div style={{paddingBottom: 8}}>
                                    <Button type="button" icon={Plus} onClick={handleAddItem} disabled={qtyInput <= 0}>
                                        Agregar
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => {setSelectedItem(null); setSearchTerm('');}} style={{marginLeft:5}}>
                                        <X size={18}/>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Tabla del Carrito */}
                <div className={styles.cart}>
                    <h3>Detalle ({detalles.length})</h3>
                    {detalles.length === 0 ? (<p className={styles.emptyText}>Orden vacía.</p>) : (
                        <div className={styles.itemsListContainer}>
                            <div className={styles.itemRowHeader}>
                                <span>Ítem</span><span>Cant.</span><span>Costo Unit.</span><span>Subtotal</span><span></span>
                            </div>
                            {detalles.map((item, index) => (
                                <CompraItemRow key={index} item={item} index={index} updateItem={updateItem} removeItem={removeItem} />
                            ))}
                        </div>
                    )}
                </div>
                
                <div className={styles.totalFooter}>
                    <h3>Total: {formatCurrency(totalCompra)}</h3>
                    <Button type="submit" icon={Save} size="lg" loading={loading} disabled={detalles.length === 0 || !proveedorId}>
                        Confirmar Compra
                    </Button>
                </div>
            </form>

            {/* --- MODALES DE CREACIÓN ANIDADOS --- */}
            {createModal.open && (
                <Modal isOpen={true} onClose={() => setCreateModal({open:false})} title={createModal.type === 'insumo' ? 'Nuevo Insumo' : 'Nuevo Producto'}>
                    {createModal.type === 'insumo' ? (
                        <InsumoForm 
                            onClose={handleCreationSuccess} 
                            useInventarioHook={inventarioHook} 
                            mode="crear"
                        />
                    ) : (
                        <ProductoForm 
                            onClose={handleCreationSuccess}
                            useProductosHook={productosHook}
                            mode="crear"
                        />
                    )}
                </Modal>
            )}
        </Card>
    );
};