// ========================================
// src/pages/Ventas/CrearVenta.jsx
// ========================================
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Check, DollarSign, Package, Scissors, 
  Plus, X, Search, CreditCard, User, Trash2, ShoppingCart, AlertCircle 
} from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { ventasApi } from '../../api/ventasApi';
import { inventarioApi } from '../../api/inventarioApi';
import { serviciosApi } from '../../api/serviciosApi';
import { clientesApi } from '../../api/clientesApi';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearVenta.module.css';

// --- Componente de Fila del Carrito ---
const CompraItemRow = ({ item, index, updateItem, removeItem }) => {
    const isService = item.tipo === 'servicio';

    const handleChangeQuantity = (e) => {
        // REGLA: Servicios siempre cantidad 1
        if (isService) return;
        
        let val = parseFloat(e.target.value);
        if (val <= 0) val = 1; // Evitar 0 o negativos
        updateItem(index, 'cantidad', val);
    };

    const handleChangePrice = (e) => {
        let val = parseFloat(e.target.value);
        // Permitir escribir decimales, la validación estricta se hace al salir o enviar
        // Aquí solo actualizamos el estado
        updateItem(index, 'precio', e.target.value);
    };

    // Al perder foco, si quedó vacío o 0, corregir
    const handleBlurPrice = (e) => {
        let val = parseFloat(e.target.value);
        if (!val || val <= 0) {
            updateItem(index, 'precio', 1); // O el precio original del producto si lo tuviéramos a mano
        }
    };

    return (
        <div className={styles.cartItem}>
            <div className={styles.cartItemInfo}>
                <span className={styles.cartItemName}>{item.nombre}</span>
                <div className={styles.cartItemMeta}>
                    {item.tipo === 'producto' 
                        ? <Badge variant="info" size="sm">Producto</Badge> 
                        : <Badge variant="success" size="sm">Servicio</Badge>
                    }
                </div>
            </div>
            
            <div className={styles.cartInputs}>
                <Input 
                    type="number"
                    value={item.cantidad}
                    onChange={handleChangeQuantity}
                    style={{width: 80}}
                    min="1" 
                    step="1"
                    title="Cantidad"
                    disabled={isService} // REGLA: Bloqueado para servicios
                />
                <div className={styles.multiply}>x</div>
                <Input 
                    type="number"
                    value={item.precio}
                    onChange={handleChangePrice}
                    onBlur={handleBlurPrice}
                    style={{width: 100}}
                    startIcon={DollarSign}
                    min="0.01" step="0.01"
                    title="Precio Unit."
                />
            </div>

            <div className={styles.cartItemTotal}>
                {formatCurrency(item.cantidad * item.precio)}
            </div>

            <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn} title="Quitar">
                <X size={16}/>
            </button>
        </div>
    );
};

export const CrearVenta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const turnoId = searchParams.get('turno_id');
  const { showSuccess, showError, confirm } = useSwal();

  // --- ESTADOS DE DATOS ---
  const [turno, setTurno] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [items, setItems] = useState([]); // Carrito
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS BUSCADOR CLIENTE ---
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesFound, setClientesFound] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isClientLocked, setIsClientLocked] = useState(false);

  // --- ESTADOS BUSCADOR ITEMS ---
  const [availableItems, setAvailableItems] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Inputs del panel de configuración de ítem
  const [qtyInput, setQtyInput] = useState(1);
  const [priceInput, setPriceInput] = useState(0);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  // 1. Cargar Datos Iniciales
  useEffect(() => {
    const initData = async () => {
      setLoadingCatalog(true);
      try {
        // A. Cargar Turno (si existe)
        if (turnoId) {
          const turnoData = await turnosApi.getTurno(turnoId);
          setTurno(turnoData);
          
          if (turnoData.cliente_id) {
              setClienteId(turnoData.cliente_id);
              setClienteSearch(turnoData.cliente); 
              setIsClientLocked(true);
          }
          
          // Precargar servicios del turno
          const serviciosTurno = (turnoData.servicios || []).map(s => ({
            list_id: `service-${s.id}`,
            tipo: 'servicio',
            id: s.id, 
            nombre: s.nombre || 'Servicio',
            precio: parseFloat(s.precio || 0),
            cantidad: 1,
          }));
          setItems(serviciosTurno);
        }

        // B. Cargar Catálogo (SOLO Servicios y Productos)
        const [serviciosData, productosData] = await Promise.all([
            serviciosApi.getServicios({ activo: true }),
            inventarioApi.getProductos({ activo: true })
        ]);

        const serviciosNorm = (serviciosData.results || serviciosData).map(s => ({
            id: s.id_serv || s.id,
            nombre: s.nombre,
            precio: parseFloat(s.precio),
            tipo: 'servicio',
            unidad: 'u'
        }));

        const productosNorm = (productosData.results || productosData).map(p => ({
            id: p.id,
            nombre: p.producto_nombre,
            precio: parseFloat(p.producto_precio),
            tipo: 'producto',
            stock_actual: p.stock,
            unidad: 'u'
        }));

        setAvailableItems([...serviciosNorm, ...productosNorm]);

      } catch (error) {
        console.error("Error init venta:", error);
        showError('Error', 'No se pudieron cargar los datos necesarios.');
      } finally {
        setLoadingCatalog(false);
      }
    };

    initData();
  }, [turnoId]);

  // 2. Buscador de Clientes (Debounce)
  useEffect(() => {
    if (isClientLocked) return;

    const delayDebounceFn = setTimeout(async () => {
      if (clienteSearch.length > 2 && !selectedCliente) {
        try {
          const res = await clientesApi.getClientes({ search: clienteSearch });
          setClientesFound(res.results || res);
        } catch (error) {
          console.error(error);
        }
      } else {
        setClientesFound([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [clienteSearch, selectedCliente, isClientLocked]);

  const handleSelectCliente = (c) => {
      setSelectedCliente(c);
      setClienteId(c.id);
      setClienteSearch(`${c.nombre} ${c.apellido}`);
      setClientesFound([]);
  };

  const handleClearCliente = () => {
      if (isClientLocked) return;
      setSelectedCliente(null);
      setClienteId(null);
      setClienteSearch('');
  };

  // 3. Filtrado de Ítems
  const searchResults = useMemo(() => {
      if (!searchTerm) return [];
      return availableItems.filter(i => 
          i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6); // Limitar a 6 resultados para no saturar
  }, [searchTerm, availableItems]);

  // --- HANDLERS CARRITO ---

  const handleSelectItem = (item) => {
      setSelectedItem(item);
      setSearchTerm(item.nombre);
      setQtyInput(1); // Reset cantidad a 1
      setPriceInput(item.precio);
  };

  const handleAddItem = () => {
      // Validaciones antes de agregar al carrito
      if (!selectedItem) return;
      if (qtyInput <= 0) {
          return showError("Error", "La cantidad debe ser mayor a 0");
      }
      if (priceInput <= 0) {
           return showError("Error", "El precio debe ser mayor a 0");
      }

      const newItem = {
          ...selectedItem,
          list_id: `${selectedItem.tipo}-${selectedItem.id}-${Date.now()}`,
          cantidad: parseFloat(qtyInput),
          precio: parseFloat(priceInput)
      };

      setItems(prev => [...prev, newItem]);
      
      // Resetear buscador
      setSearchTerm('');
      setSelectedItem(null);
      setQtyInput(1);
      setPriceInput(0);
  };

  const updateItem = (index, field, value) => {
      setItems(prev => prev.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
      ));
  };

  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  // --- SUBMIT ---
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const handleSubmit = async () => {
      if (items.length === 0) return showError("Carrito Vacío", "Agrega ítems para cobrar.");
      
      if (!clienteId) {
          showError("Falta Cliente", "Debe seleccionar un cliente para registrar la venta.");
          document.getElementById('client-search')?.focus();
          return;
      }

      if (!await confirm({
          title: 'Confirmar Venta',
          text: `Total: ${formatCurrency(total)}\nPago: ${metodoPago.toUpperCase()}`
      })) return;

      setLoading(true);
      try {
          const validServices = items.filter(i => i.tipo === 'servicio' && i.id);
          const validProducts = items.filter(i => i.tipo === 'producto' && i.id);

          const payload = {
              turno_id: turnoId ? parseInt(turnoId) : null,
              cliente_id: clienteId,
              metodo_pago: metodoPago,
              descuento: 0,
              servicios: validServices.map(i => ({
                  servicio_id: parseInt(i.id),
                  cantidad: 1, // REGLA: Siempre 1 para servicios
                  precio: parseFloat(i.precio),
                  descuento: 0
              })),
              productos: validProducts.map(i => ({
                  producto_id: parseInt(i.id),
                  cantidad: parseFloat(i.cantidad),
                  precio_unitario: parseFloat(i.precio),
                  descuento: 0
              }))
          };

          await ventasApi.crearVenta(payload);
          await showSuccess('Venta Exitosa', 'Operación registrada correctamente.');
          navigate('/ventas');

      } catch (error) {
          console.error(error);
          const msg = error.response?.data?.detail || "Error al procesar venta: Verifique la apertura de Caja.";
          showError("Error", msg);
      } finally {
          setLoading(false);
      }
  };

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      <header className={styles.header}>
        <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate(-1)}>Volver</Button>
        <h1 className={styles.title}>{turno ? `Cobrar Turno #${turnoId}` : 'Nueva Venta Manual'}</h1>
      </header>

      <div className={styles.contentGrid}>
        
        <div className={styles.leftColumn}>
            
            {/* 1. SELECCIÓN DE CLIENTE */}
            <Card className={`${styles.searchCard} ${styles.overflowVisible}`}>
                <div className={styles.searchHeader}>
                    <User className={styles.searchIcon} size={20}/>
                    <input 
                        id="client-search"
                        type="text" 
                        className={styles.mainSearchInput}
                        placeholder={isClientLocked ? "Cliente vinculado al turno" : "Buscar cliente (Nombre o Email)..."}
                        value={clienteSearch}
                        onChange={e => { setClienteSearch(e.target.value); setSelectedCliente(null); setClienteId(null); }}
                        disabled={isClientLocked}
                        autoComplete="off"
                    />
                    {!isClientLocked && (selectedCliente || clienteSearch) && (
                        <button className={styles.clearSearchBtn} onClick={handleClearCliente}>
                            <X size={18}/>
                        </button>
                    )}
                </div>

                {!isClientLocked && !selectedCliente && clientesFound.length > 0 && (
                    <div className={styles.resultsDropdown}>
                        {clientesFound.map(c => (
                            <div key={c.id} className={styles.resultItem} onClick={() => handleSelectCliente(c)}>
                                <User size={14} className={styles.iconGray}/>
                                <div className={styles.resultInfo}>
                                    <span className={styles.resultName}>{c.nombre} {c.apellido}</span>
                                    <span className={styles.stockLabel}>{c.email}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* 2. AGREGAR ÍTEMS */}
            <Card className={`${styles.searchCard} ${styles.overflowVisible}`}>
                <div className={styles.searchHeader}>
                    <Search className={styles.searchIcon} size={20}/>
                    <input 
                        type="text" 
                        className={styles.mainSearchInput}
                        placeholder="Buscar productos o servicios..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setSelectedItem(null); }}
                        disabled={!!selectedItem} 
                    />
                    {selectedItem && (
                        <button className={styles.clearSearchBtn} onClick={() => {setSelectedItem(null); setSearchTerm('');}}>
                            <X size={18}/>
                        </button>
                    )}
                </div>

                {/* Dropdown Ítems (Solo Selección, SIN creación) */}
                {!selectedItem && searchTerm && searchResults.length > 0 && (
                    <div className={styles.resultsDropdown}>
                        {searchResults.map(item => (
                            <div key={`${item.tipo}-${item.id}`} className={styles.resultItem} onClick={() => handleSelectItem(item)}>
                                {item.tipo === 'servicio' ? <Scissors size={14} className={styles.iconBlue}/> : <Package size={14} className={styles.iconGray}/>}
                                <div className={styles.resultInfo}>
                                    <span className={styles.resultName}>{item.nombre}</span>
                                    <div className={styles.resultMeta}>
                                        <span className={styles.stockLabel}>{item.tipo}</span>
                                        {item.stock_actual !== undefined && <span className={styles.stockLabel}>Stock: {parseFloat(item.stock_actual)}</span>}
                                    </div>
                                </div>
                                <span className={styles.resultPrice}>{formatCurrency(item.precio)}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                {!selectedItem && searchTerm && searchResults.length === 0 && !loadingCatalog && (
                    <div className={styles.noResults}>
                        No se encontraron productos o servicios activos con ese nombre.
                    </div>
                )}

                {/* Panel Configuración de Ítem */}
                {selectedItem && (
                    <div className={styles.itemConfigPanel}>
                        <div className={styles.configRow}>
                            <Input 
                                label="Cantidad" 
                                type="number" 
                                value={qtyInput} 
                                onChange={e => setQtyInput(parseFloat(e.target.value))} // ParseFloat inmediato
                                style={{width: 100}} 
                                autoFocus
                                min="1"
                                // REGLA: Deshabilitar si es servicio
                                disabled={selectedItem.tipo === 'servicio'}
                            />
                            <Input 
                                label="Precio Unit." 
                                type="number" 
                                value={priceInput} 
                                onChange={e => setPriceInput(parseFloat(e.target.value))} 
                                style={{width: 120}} 
                                startIcon={DollarSign}
                                min="0.01"
                                step="0.01"
                            />
                            <Button icon={Plus} onClick={handleAddItem} disabled={qtyInput <= 0 || priceInput <= 0}>
                                Agregar
                            </Button>
                        </div>
                        {selectedItem.tipo === 'servicio' && (
                            <div style={{marginTop: 8, fontSize: '0.8rem', color: '#64748b'}}>
                                * Los servicios se registran por unidad.
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* 3. LISTA CARRITO */}
            <div className={styles.cartContainer}>
                <h3 className={styles.sectionTitle}>Ítems ({items.length})</h3>
                {items.length === 0 ? (
                    <div className={styles.emptyCart}><ShoppingCart size={40} color="#cbd5e1"/><p>Carrito vacío.</p></div>
                ) : (
                    <div className={styles.cartList}>
                        {items.map((item, index) => (
                            <CompraItemRow key={item.list_id || index} item={item} index={index} updateItem={updateItem} removeItem={removeItem} />
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* --- DERECHA: RESUMEN --- */}
        <div className={styles.rightColumn}>
            <Card className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Resumen de Venta</h2>
                
                <div className={styles.clientBadge} style={!clienteId ? {border: '1px solid #ef4444', background: '#fef2f2', color: '#b91c1c'} : {}}>
                    <User size={16} />
                    <span>
                        {clienteId 
                            ? (selectedCliente ? `${selectedCliente.nombre} ${selectedCliente.apellido}` : (turno?.cliente || 'Cliente Seleccionado')) 
                            : 'Seleccione Cliente *'}
                    </span>
                </div>

                <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalValue}>{formatCurrency(total)}</span>
                </div>

                <div className={styles.paymentSection}>
                    <label className={styles.paymentLabel}>Método de Pago</label>
                    <div className={styles.paymentOptions}>
                        <button type="button" className={`${styles.paymentBtn} ${metodoPago === 'efectivo' ? styles.active : ''}`} onClick={() => setMetodoPago('efectivo')}>
                            <DollarSign size={20}/> Efectivo
                        </button>
                        <button type="button" className={`${styles.paymentBtn} ${metodoPago === 'transferencia' ? styles.active : ''}`} onClick={() => setMetodoPago('transferencia')}>
                            <CreditCard size={20}/> Transf.
                        </button>
                    </div>
                </div>

                <Button fullWidth size="lg" icon={Check} onClick={handleSubmit} loading={loading} disabled={items.length === 0} className={styles.confirmBtn}>
                    Cobrar
                </Button>
            </Card>
        </div>
      </div>
    </motion.div>
  );
};