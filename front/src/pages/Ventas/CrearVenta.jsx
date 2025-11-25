// ========================================
// src/pages/Ventas/CrearVenta.jsx (POS Final)
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, DollarSign, Package, Scissors, Plus, X, Search, CreditCard } from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { ventasApi } from '../../api/ventasApi';
import { inventarioApi } from '../../api/inventarioApi'; // Para Productos
import { serviciosApi } from '../../api/serviciosApi'; // Para Servicios
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearVenta.module.css'; // Asumiendo que existe

export const CrearVenta = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const turnoId = searchParams.get('turno_id');
  const { showSuccess, showError, confirm } = useSwal();

  // Estados principales de la venta
  const [turno, setTurno] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [items, setItems] = useState([]); // Array principal del carrito (mezcla servicios/productos)
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);

  // Estados para el Selector Dinámico
  const [availableItems, setAvailableItems] = useState({ services: [], products: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [loadingItems, setLoadingItems] = useState(false);

  // --- HOOK DE CARGA INICIAL (Turno y Catálogos) ---
  useEffect(() => {
    // 1. Cargar Turno (Si existe)
    if (turnoId) {
      const fetchTurno = async () => {
        try {
          const data = await turnosApi.getTurno(turnoId);
          setTurno(data);
          setClienteId(data.cliente_id || null);
          
          // Pre-carga los servicios del turno al carrito
          const serviciosIniciales = (data.servicios || []).map(s => ({
            tipo: 'servicio',
            id: s.id, 
            nombre: s.nombre || 'Servicio',
            precio: parseFloat(s.precio || 0),
            cantidad: 1,
          }));
          setItems(serviciosIniciales);
        } catch (error) {
          showError('Error', 'No se pudo cargar la información del turno.');
          navigate('/turnos');
        }
      };
      fetchTurno();
    }
    
    // 2. Cargar Inventario (Servicios y Productos)
    const fetchInventory = async () => {
        setLoadingItems(true);
        try {
            const [servicesData, productsData] = await Promise.all([
                serviciosApi.getServicios(), // API correcta para Servicios
                inventarioApi.getProductos(),
            ]);

            setAvailableItems({ 
                services: servicesData.results || servicesData,
                products: productsData.results || productsData
            });
        } catch (error) {
            console.error("Error cargando inventario para venta:", error);
        } finally {
            setLoadingItems(false);
        }
    };
    fetchInventory();
  }, [turnoId, navigate, showError]);

  // --- LÓGICA DE CARRITO ---

  // Filtra y unifica los catálogos disponibles para el buscador
  const allAvailable = [
    // Servicios
    ...availableItems.services.map(s => ({
        ...s, 
        list_id: `service-${s.id_serv}`,
        type: 'servicio', 
        name: s.nombre,
        price: parseFloat(s.precio || 0),
    })),
    // Productos
    ...availableItems.products.map(p => ({
        ...p, 
        list_id: `product-${p.id}`,
        type: 'producto', 
        name: p.producto_nombre,
        price: p.producto_precio 
    })),
  ].filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Añade un ítem seleccionado al carrito
  const handleAddItem = (item) => {
    if (selectedQty < 1) return;
    
    const newItem = {
        tipo: item.type,
        id: item.id,
        nombre: item.name,
        precio: parseFloat(item.price),
        cantidad: selectedQty,
    };

    setItems(prev => [...prev, newItem]);
    setSearchTerm('');
    setSelectedQty(1);
  };
  
  // Actualiza precio o cantidad de un ítem existente en el carrito
  const updateItem = (index, field, value) => {
    // Permite string vacío para que el usuario pueda borrar antes de escribir
    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
    
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: numericValue } : item
    ));
  };
  
  // Eliminar ítem
  const removeItem = (index) => {
      setItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // Calcula el total acumulado
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);


  // --- HANDLER DE SUBMIT ---
  const handleSubmit = async () => {
    // 1. Validaciones
    if (items.length === 0) {
        showError('Carrito Vacío', 'Debe agregar al menos un ítem.');
        return;
    }
    const isConfirmed = await confirm('Confirmar Venta', `¿Desea cobrar ${formatCurrency(total)} con método de pago ${metodoPago}?`);
    if (!isConfirmed) return;

    setLoading(true);
    try {
      // --- PASO CLAVE: SANITIZAR Y FILTRAR ÍTEMS SIN ID ---
      const validServices = items.filter(i => i.tipo === 'servicio' && !!i.id);
      const validProducts = items.filter(i => i.tipo === 'producto' && !!i.id);

      // Si después de filtrar no hay nada válido
      if (validServices.length === 0 && validProducts.length === 0) {
          throw new Error('El carrito no contiene ítems válidos para registrar (IDs faltantes).');
      }

      // 1. Payload de Servicios (usa 'precio')
      const serviciosPayload = validServices.map(i => ({
          servicio_id: parseInt(i.id), // Aseguramos que sea INT
          cantidad: parseInt(i.cantidad),
          precio: parseFloat(i.precio), 
          descuento: 0
      }));

      // 2. Payload de Productos (usa 'precio_unitario')
      const productosPayload = validProducts.map(i => ({
          producto_id: parseInt(i.id), // Aseguramos que sea INT
          cantidad: parseInt(i.cantidad),
          precio_unitario: parseFloat(i.precio),
          descuento: 0
      }));

      // 3. Envío
      await ventasApi.crearVenta({
        turno_id: turnoId ? parseInt(turnoId) : null,
        cliente_id: clienteId || null,
        servicios: serviciosPayload,
        productos: productosPayload,
        metodo_pago: metodoPago,
        descuento: 0,
      });

      await showSuccess('¡Venta registrada!', 'La caja y el stock han sido actualizados.');
      navigate('/ventas');

    } catch (error) {
      console.error('Error al crear la venta:', error);
      
      let mensajeError = "No se pudo registrar la venta.";

      if (error.response && error.response.data) {
          const data = error.response.data;
          
          if (data.detail) {
              mensajeError = data.detail;
          } else if (typeof data === 'object' && Object.keys(data).length > 0) {
              const primerCampo = Object.keys(data)[0];
              const errorCampo = data[primerCampo];
              mensajeError = `${primerCampo.toUpperCase()}: ${Array.isArray(errorCampo) ? errorCampo[0] : errorCampo}`;
          }
      }

      showError('Error al Vender', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <Button 
          variant="secondary" 
          icon={ChevronLeft} 
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
        <h1>{turno ? `Venta del Turno #${turnoId}` : 'Nueva Venta'}</h1>
        <div style={{width: 80}}></div>
      </header>

      <div className={styles.content}>
        <Card>
            {/* --- SECCIÓN 1: AGREGAR ÍTEMS DINÁMICOS --- */}
            <h2 style={{fontSize: '1.2rem', marginBottom: 15}}>Agregar al Carrito</h2>
            <div className={styles.addItemBar}>
                <Input
                    type="text"
                    placeholder="Buscar producto o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                />
                <Input
                    type="number"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                    style={{width: 80, minWidth: 80}}
                    min="1"
                    title="Cantidad"
                />
            </div>
            
            {/* Resultados de la Búsqueda / Selector */}
            <div className={styles.selectorResults}>
                {loadingItems ? (
                    <p>Cargando catálogos...</p>
                ) : allAvailable.length > 0 && searchTerm ? (
                    allAvailable.slice(0, 10).map((item) => (
                        <div 
                            key={item.list_id} 
                            className={styles.selectorItem}
                            onClick={() => handleAddItem(item)}
                        >
                            <Badge variant={item.type === 'servicio' ? 'info' : 'primary'} size="sm" style={{marginRight: 8}}>
                                {item.type === 'servicio' ? <Scissors size={14} /> : <Package size={14} />}
                            </Badge>
                            {item.name} ({formatCurrency(item.price)})
                            <Plus size={16} style={{marginLeft:'auto'}}/>
                        </div>
                    ))
                ) : searchTerm && <p className={styles.noResults}>No se encontraron resultados.</p>}
            </div>
            
            <hr style={{margin: '20px 0'}}/>
            
            {/* --- SECCIÓN 2: CARRITO DE ÍTEMS (RESUMEN) --- */}
            <h2 style={{fontSize: '1.2rem', marginBottom: 20}}>Cargado ({items.length})</h2>
            
            <div className={styles.itemsList}>
                {items.length === 0 && <p style={{textAlign:'center', color:'#6b7280'}}>El carrito está vacío.</p>}
                {items.map((item, index) => (
                  <div key={index} className={styles.item} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #eee'}}>
                    <div style={{flex: 1}}>
                        <span className={styles.itemName} style={{fontWeight:500}}>{item.nombre}</span>
                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>
                            <span style={{marginRight: 5}}>
                                {item.tipo === 'servicio' ? 'Servicio' : 'Producto'}
                            </span>
                            <Input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                              style={{width: 50, display: 'inline-block', padding: '5px 8px'}}
                              min="1"
                            />
                        </div>
                    </div>
                    <div style={{width: 150, display: 'flex', gap: 10, alignItems: 'center'}}>
                        <Input
                          type="number"
                          value={item.precio}
                          onChange={(e) => updateItem(index, 'precio', e.target.value)}
                          style={{width: 80}}
                          title="Precio Unitario"
                        />
                        <button type="button" onClick={() => removeItem(index)} className={styles.removeBtn}>
                            <X size={16} />
                        </button>
                    </div>
                  </div>
                ))}
            </div>

            <hr style={{margin: '20px 0'}}/>
            
            {/* --- SECCIÓN 3: PAGO Y TOTAL --- */}
            <h2 style={{fontSize: '1.2rem', marginBottom: 15}}>Método de Pago</h2>
            <div style={{display:'flex', gap: 10, marginBottom: 20}}>
                <Button 
                    variant={metodoPago === 'efectivo' ? 'primary' : 'outline'} 
                    onClick={() => setMetodoPago('efectivo')}
                    icon={DollarSign}
                >
                    Efectivo
                </Button>
                <Button 
                    variant={metodoPago === 'transferencia' ? 'primary' : 'outline'} 
                    onClick={() => setMetodoPago('transferencia')}
                    icon={CreditCard}
                >
                    Transferencia
                </Button>
            </div>

            {/* Total */}
            <div className={styles.totalSection} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop: 25, marginBottom: 25, padding: 15, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0'}}>
                <span style={{fontSize:'1.1rem', fontWeight:600, color: '#166534'}}>Total a Cobrar</span>
                <span className={styles.totalAmount} style={{fontSize:'1.5rem', fontWeight:'bold', color: '#166534'}}>
                    {formatCurrency(total)}
                </span>
            </div>
            
            <Button
                fullWidth
                icon={Check}
                loading={loading}
                onClick={handleSubmit}
                size="lg"
                disabled={items.length === 0}
            >
                Confirmar y Cobrar
            </Button>
        </Card>
      </div>
    </motion.div>
  );
};