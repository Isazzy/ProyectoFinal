// ========================================
// src/pages/Compras/CompraForm.jsx
// ========================================
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, DollarSign, Save, ShoppingCart, X, Tag, Calculator, Truck, CreditCard, Search } from 'lucide-react';
import { useCompras } from '../../hooks/useCompras';
import { inventarioApi } from '../../api/inventarioApi'; 
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import styles from '../../styles/Compras.module.css';
import { formatCurrency } from '../../utils/formatters';

// Importamos los formularios para creación rápida
import { InsumoForm } from '../../components/forms/InsumoForm';
import { ProductoForm } from '../Inventario/ProductoForm';
import { useInventario } from '../../hooks/useInventario';
import { useProductos } from '../../hooks/useProductos';

// --- Componente de Fila del Carrito ---
const CompraItemRow = ({ item, index, updateItem, removeItem }) => {
    return (
        <div className={styles.cartItem}>
            <div className={styles.cartItemInfo}>
                <span className={styles.cartItemName}>{item.nombre}</span>
                <div className={styles.cartItemMeta}>
                    {item.tipo === 'insumo' ? <Badge variant="secondary" size="sm">Insumo</Badge> : <Badge variant="info" size="sm">Producto</Badge>}
                    <span className={styles.unitLabel}>{item.unidad}</span>
                </div>
            </div>
            
            <div className={styles.cartInputs}>
                <Input 
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                    style={{width: 80}}
                    min="0.01" step="any"
                    title="Cantidad"
                />
                <div className={styles.multiply}>x</div>
                <Input 
                    type="number"
                    value={item.precio}
                    onChange={(e) => updateItem(index, 'precio', e.target.value)}
                    style={{width: 100}}
                    startIcon={DollarSign}
                    min="0" step="0.01"
                    title="Costo Unitario"
                />
            </div>

            <div className={styles.cartItemTotal}>
                {formatCurrency(item.cantidad * item.precio)}
            </div>

            <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn} title="Eliminar">
                <X size={16}/>
            </button>
        </div>
    );
};

// --- Componente Principal ---
export const CompraForm = ({ onClose }) => {
    const { proveedores, crearCompra, loading, fetchProveedores } = useCompras();
    
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

    // Estado para Modales
    const [createModal, setCreateModal] = useState({ open: false, type: null }); 

    // Carga de Catálogos
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

    useEffect(() => {
        fetchProveedores();
        cargarCatalogo();
    }, [fetchProveedores, cargarCatalogo]);

    // Filtrado
    const filteredItems = allItems.filter(i => 
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6);

    // Lógica de Unidades
    const isConvertible = selectedItem && (['ml', 'g', 'cm3'].includes(selectedItem.unidad.toLowerCase()));
    const getRealQuantity = () => (isConvertible && unitMode === 'kilo') ? parseFloat(qtyInput) * 1000 : parseFloat(qtyInput);

    // Handlers
    const handleAddItem = () => {
        if (!selectedItem || qtyInput <= 0) return;

        const newItem = {
            ...selectedItem,
            cantidad: getRealQuantity(),
            precio: parseFloat(priceInput) 
        };

        setDetalles(prev => [...prev, newItem]);
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

    const handleQuickCreate = (tipo) => {
        setCreateModal({ open: true, type: tipo });
    };

    const handleCreationSuccess = async () => {
        setCreateModal({ open: false, type: null });
        await cargarCatalogo();
    };

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
        <div className={styles.container}>
            {/* --- LAYOUT 2 COLUMNAS --- */}
            <div className={styles.grid}>
                
                {/* COLUMNA IZQUIERDA: OPERACIÓN */}
                <div className={styles.leftCol}>
                    
                    {/* 1. DATOS DE CONTEXTO */}
                    <Card className={styles.contextCard}>
                        <div className={styles.cardHeader}>
                            <h3><Truck size={18}/> Datos del Proveedor</h3>
                        </div>
                        <div className={styles.contextRow}>
                             <div className={styles.inputGroup}>
                                <label>Proveedor *</label>
                                <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} className={styles.selectInput} required>
                                    <option value="">Seleccionar...</option>
                                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.proveedor_nombre}</option>)}
                                </select>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Método Pago *</label>
                                <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className={styles.selectInput} required>
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* 2. BUSCADOR Y AGREGADO */}
                    <Card className={`${styles.searchCard} ${styles.overflowVisible}`}>
                        <div className={styles.cardHeader}>
                            <h3><Package size={18}/> Agregar Ítems</h3>
                        </div>
                        
                        <div className={styles.searchWrapper}>
                            <Input 
                                placeholder="Buscar insumo o producto..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                icon={Search}
                                disabled={!!selectedItem} 
                            />
                            
                            {/* Dropdown Resultados */}
                            {!selectedItem && searchTerm && (
                                <div className={styles.searchResults}>
                                    {filteredItems.map(i => (
                                        <div key={i.key} className={styles.resultItem} onClick={() => {setSelectedItem(i); setSearchTerm(i.nombre);}}>
                                            {i.tipo === 'insumo' ? <Package size={14} className={styles.iconGray}/> : <Tag size={14} className={styles.iconBlue}/>}
                                            <span className={styles.resName}>{i.nombre}</span>
                                            <span className={styles.resUnit}>({i.unidad})</span>
                                        </div>
                                    ))}
                                    {/* Botones Crear Nuevo */}
                                    <div className={styles.createActions}>
                                        <span className={styles.createLabel}>¿No está en la lista?</span>
                                        <div className={styles.createBtns}>
                                            <Button size="sm" variant="outline" onClick={() => handleQuickCreate('insumo')}>+ Insumo</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleQuickCreate('producto')}>+ Producto</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Panel Configuración Ítem */}
                        {selectedItem && (
                            <div className={styles.configPanel}>
                                <div className={styles.configHeader}>
                                    <span className={styles.configTitle}>{selectedItem.nombre}</span>
                                    {isConvertible && (
                                        <div className={styles.unitToggle}>
                                            <Calculator size={14}/>
                                            <select value={unitMode} onChange={e => setUnitMode(e.target.value)} className={styles.miniSelect}>
                                                <option value="base">{selectedItem.unidad}</option>
                                                <option value="kilo">{selectedItem.unidad === 'ml' ? 'Litros' : 'Kilos'}</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.configInputs}>
                                    <Input 
                                        label="Cantidad" type="number" value={qtyInput} onChange={e => setQtyInput(parseFloat(e.target.value)||0)} style={{width: 100}} autoFocus
                                    />
                                    <Input 
                                        label="Costo Total ($)" type="number" value={priceInput} onChange={e => setPriceInput(parseFloat(e.target.value)||0)} style={{width: 120}} startIcon={DollarSign}
                                    />
                                    <div className={styles.configActions}>
                                        <Button icon={Plus} onClick={handleAddItem} disabled={qtyInput <= 0}>Agregar</Button>
                                        <Button variant="ghost" onClick={() => {setSelectedItem(null); setSearchTerm('');}}><X size={18}/></Button>
                                    </div>
                                </div>
                                {isConvertible && unitMode === 'kilo' && qtyInput > 0 && (
                                    <div className={styles.conversionHint}>
                                        Se guardarán <strong>{qtyInput * 1000} {selectedItem.unidad}</strong> en stock.
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* 3. LISTA CARRITO */}
                    <div className={styles.cartContainer}>
                        <h3 className={styles.sectionTitle}>Detalle de la Orden ({detalles.length})</h3>
                        {detalles.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ShoppingCart size={40} color="#cbd5e1"/>
                                <p>El carrito de compra está vacío.</p>
                            </div>
                        ) : (
                            <div className={styles.itemsList}>
                                {detalles.map((item, index) => (
                                    <CompraItemRow key={index} item={item} index={index} updateItem={updateItem} removeItem={removeItem} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: RESUMEN STICKY */}
                <div className={styles.rightCol}>
                    <Card className={styles.summaryCard}>
                        <h2 className={styles.summaryTitle}>Resumen</h2>
                        
                        <div className={styles.summaryRow}>
                            <span>Ítems</span>
                            <strong>{detalles.length}</strong>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Proveedor</span>
                            <strong>{proveedores.find(p => p.id == proveedorId)?.proveedor_nombre || '-'}</strong>
                        </div>

                        <div className={styles.divider}></div>

                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span className={styles.totalValue}>{formatCurrency(totalCompra)}</span>
                        </div>

                        <Button 
                            fullWidth 
                            size="lg" 
                            icon={Save} 
                            onClick={handleSubmit} 
                            loading={loading} 
                            disabled={detalles.length === 0 || !proveedorId}
                            className={styles.confirmBtn}
                        >
                            Confirmar Compra
                        </Button>
                        
                        <Button variant="ghost" fullWidth onClick={onClose} style={{marginTop: 10}}>
                            Cancelar
                        </Button>
                    </Card>
                </div>

            </div>

            {/* MODALES */}
            {createModal.open && (
                <Modal isOpen={true} onClose={() => setCreateModal({open:false})} title={createModal.type === 'insumo' ? 'Nuevo Insumo' : 'Nuevo Producto'}>
                    {createModal.type === 'insumo' ? (
                        <InsumoForm onClose={handleCreationSuccess} useInventarioHook={inventarioHook} mode="crear" />
                    ) : (
                        <ProductoForm onClose={handleCreationSuccess} useProductosHook={productosHook} mode="crear" />
                    )}
                </Modal>
            )}
        </div>
    );
};