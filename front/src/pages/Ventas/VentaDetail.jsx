// ========================================
// src/pages/Ventas/VentaDetail.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Printer, XCircle, User, Calendar, 
    CreditCard, Box, ShoppingBag, AlertTriangle 
} from 'lucide-react';
import { ventasApi } from '../../api/ventasApi';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/VentaDetail.module.css';

export const VentaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, showSuccess, showError } = useSwal();
  
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    const fetchVenta = async () => {
      try {
        const data = await ventasApi.getVenta(id);
        setVenta(data);
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo cargar la venta.');
        navigate('/ventas');
      } finally {
        setLoading(false);
      }
    };
    fetchVenta();
  }, [id, navigate, showError]);

  // Acción: Anular Venta
  const handleAnular = async () => {
    if (!venta) return;
    
    // 1. Validar Estado
    const estadoActual = venta.estado_venta?.estado_venta_nombre?.toLowerCase() || '';
    if (estadoActual.includes('anulado') || estadoActual.includes('devolución')) return;

    // 2. Validar Contenido (Solo Productos son reembolsables)
    const hasProducts = venta.productos && venta.productos.length > 0;
    const hasServices = venta.servicios && venta.servicios.length > 0;
    
    let warningText = 'Se registrará un egreso de dinero.';
    if (hasServices && hasProducts) {
        warningText = 'Solo se devolverá el dinero de los productos. Los servicios no se reembolsan.';
    } else if (hasServices && !hasProducts) {
        showError("No permitido", "No se pueden anular ventas que contienen solo servicios.");
        return;
    }

    // 3. Confirmar
    if (await confirm({ 
        title: '¿Procesar Devolución?', 
        text: `${warningText} El stock NO se repone (producto usado).`, 
        icon: 'warning',
        isDanger: true
    })) {
        try {
            const estados = await ventasApi.getEstadosVenta();
            const estadoAnulado = estados.find(e => e.estado_venta_nombre.toLowerCase() === 'anulado');
            
            if (!estadoAnulado) throw new Error("Estado 'Anulado' no configurado.");

            await ventasApi.anularVenta(venta.id, estadoAnulado.id);
            
            await showSuccess('Procesado', 'La devolución se ha registrado correctamente.');
            
            // Recargar datos
            const updated = await ventasApi.getVenta(id);
            setVenta(updated);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || 'No se pudo anular la venta.';
            showError('Error', msg);
        }
    }
  };

  if (loading) return <div className={styles.loading}><ShoppingBag className="animate-spin"/> Cargando detalle...</div>;
  if (!venta) return <div className={styles.error}><AlertTriangle/> Venta no encontrada</div>;

  // Unificar items para la tabla
  const items = [
    ...(venta.productos || []).map(p => ({ ...p, tipo: 'Producto', nombre: p.producto_nombre, precio: p.detalle_venta_precio_unitario, cantidad: p.detalle_venta_cantidad })),
    ...(venta.servicios || []).map(s => ({ ...s, tipo: 'Servicio', nombre: s.servicio_nombre, precio: s.precio, cantidad: s.cantidad }))
  ];

  const estadoNombre = venta.estado_venta?.estado_venta_nombre || 'Desconocido';
  const estadoLower = estadoNombre.toLowerCase();

  // Lógica de Badge
  let badgeVariant = 'success';
  if (estadoLower.includes('anulado')) badgeVariant = 'danger';
  else if (estadoLower.includes('devolución')) badgeVariant = 'warning';
  else if (estadoLower.includes('pendiente')) badgeVariant = 'secondary';

  // Lógica de Botón Anular
  const isActionDisabled = estadoLower.includes('anulado') || estadoLower.includes('devolución');
  const hasProducts = venta.productos && venta.productos.length > 0;

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
            <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/ventas')}>
                Volver
            </Button>
            <h1>Venta #{venta.id}</h1>
        </div>
        
        <div className={styles.actions}>
            {!isActionDisabled && hasProducts && (
                <Button variant="danger" icon={XCircle} onClick={handleAnular}>
                    Anular / Devolver
                </Button>
            )}
        </div>
      </header>

      <div className={styles.contentGrid}>
        
        {/* COLUMNA IZQUIERDA: INFO */}
        <div className={styles.leftCol}>
            <div className={styles.infoCard}>
                <div className={styles.statusHeader}>
                    <span className={styles.label}>Estado Actual</span>
                    <Badge variant={badgeVariant} size="lg">{estadoNombre}</Badge>
                </div>
                
                <div className={styles.infoGroup}>
                    <div className={styles.iconBox}><Calendar size={18} /></div>
                    <div className={styles.dataGroup}>
                        <span className={styles.label}>Fecha de Emisión</span>
                        <span className={styles.value}>{formatDate(venta.venta_fecha_hora)}</span>
                        <span className={styles.subValue}>
                            {new Date(venta.venta_fecha_hora).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>

                <div className={styles.infoGroup}>
                    <div className={styles.iconBox}><User size={18} /></div>
                    <div className={styles.dataGroup}>
                        <span className={styles.label}>Cliente</span>
                        <span className={styles.value}>
                            {venta.cliente 
                                ? `${venta.cliente.nombre} ${venta.cliente.apellido}` 
                                : 'Consumidor Final'}
                        </span>
                    </div>
                </div>

                <div className={styles.infoGroup}>
                    <div className={styles.iconBox}><Box size={18} /></div>
                    <div className={styles.dataGroup}>
                        <span className={styles.label}>Atendido por</span>
                        <span className={styles.value}>{venta.empleado_nombre || '-'}</span>
                    </div>
                </div>

                <div className={styles.infoGroup}>
                    <div className={styles.iconBox}><CreditCard size={18} /></div>
                    <div className={styles.dataGroup}>
                        <span className={styles.label}>Pago</span>
                        <span className={styles.value} style={{textTransform: 'capitalize'}}>
                            {venta.venta_medio_pago}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE (Main) */}
        <div className={styles.rightCol}>
            <div className={styles.detailCard}>
                <div className={styles.cardHeader}>
                    <h2>Detalle de Ítems</h2>
                </div>
                
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{width: '50%'}}>Descripción</th>
                            <th style={{textAlign:'center'}}>Cant.</th>
                            <th style={{textAlign:'right'}}>Precio</th>
                            <th style={{textAlign:'right'}}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <span className={styles.itemName}>
                                        {item.nombre}
                                        <span className={styles.itemType}>{item.tipo}</span>
                                    </span>
                                </td>
                                <td style={{textAlign:'center', fontWeight: 500}}>{item.cantidad}</td>
                                <td style={{textAlign:'right'}} className={styles.numeric}>{formatCurrency(item.precio)}</td>
                                <td style={{textAlign:'right', fontWeight: 700}} className={styles.numeric}>
                                    {formatCurrency(item.precio * item.cantidad)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.invoiceFooter}>
                    <div className={styles.totalsContainer}>
                        <div className={styles.totalRow}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(parseFloat(venta.venta_total) + parseFloat(venta.venta_descuento))}</span>
                        </div>
                        {parseFloat(venta.venta_descuento) > 0 && (
                            <div className={`${styles.totalRow} ${styles.discount}`}>
                                <span>Descuento</span>
                                <span>- {formatCurrency(venta.venta_descuento)}</span>
                            </div>
                        )}
                        <div className={styles.divider}></div>
                        <div className={styles.finalTotal}>
                            <span>Total</span>
                            <span className={styles.totalAmount}>{formatCurrency(venta.venta_total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
};