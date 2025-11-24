import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Printer, XCircle, User, Calendar, CreditCard, Box } from 'lucide-react';
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
    
    const estadoActual = venta.estado_venta?.estado_venta_nombre?.toLowerCase() || '';
    if (estadoActual.includes('anulado') || estadoActual.includes('devolución')) return;

    if (await confirm({ 
        title: '¿Procesar Devolución?', 
        text: 'Se registrará un egreso de dinero por el valor de los productos. El stock NO se repone.', 
        icon: 'warning' 
    })) {
        try {
            const estados = await ventasApi.getEstadosVenta();
            const estadoAnulado = estados.find(e => e.estado_venta_nombre.toLowerCase() === 'anulado');
            
            if (!estadoAnulado) throw new Error("Estado 'Anulado' no configurado.");

            await ventasApi.anularVenta(venta.id, estadoAnulado.id);
            
            await showSuccess('Procesado', 'La devolución se ha registrado correctamente.');
            
            const updated = await ventasApi.getVenta(id);
            setVenta(updated);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.detail || 'No se pudo anular la venta.';
            showError('Error', msg);
        }
    }
  };

  if (loading) return <div className="p-5 text-center">Cargando detalle...</div>;
  if (!venta) return null;

  // Unificar items
  const items = [
    ...(venta.productos || []).map(p => ({ ...p, tipo: 'Producto', nombre: p.producto_nombre, precio: p.detalle_venta_precio_unitario, cantidad: p.detalle_venta_cantidad })),
    ...(venta.servicios || []).map(s => ({ ...s, tipo: 'Servicio', nombre: s.servicio_nombre, precio: s.precio, cantidad: s.cantidad }))
  ];

  const estadoNombre = venta.estado_venta?.estado_venta_nombre || 'Desconocido';
  const estadoLower = estadoNombre.toLowerCase();

  let badgeVariant = 'success';
  if (estadoLower.includes('anulado')) badgeVariant = 'danger';
  else if (estadoLower.includes('devolución')) badgeVariant = 'warning';
  else if (estadoLower.includes('pendiente')) badgeVariant = 'secondary';

  // --- LÓGICA DE VISIBILIDAD DEL BOTÓN ---
  const isActionDisabled = estadoLower.includes('anulado') || estadoLower.includes('devolución');
  
  // Solo mostramos el botón si la venta contiene al menos un PRODUCTO.
  // Si es solo servicios, no hay nada que devolver.
  const hasProducts = venta.productos && venta.productos.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ChevronLeft size={24} /> Volver
        </button>
        <h1 className={styles.title}>Venta #{venta.id}</h1>
        <div className={styles.actions}>
            <Button variant="outline" icon={Printer} onClick={() => window.print()}>Imprimir</Button>
            
            {/* Solo mostrar ANULAR si no está anulada Y si tiene productos para devolver */}
            {!isActionDisabled && hasProducts && (
                <Button variant="danger" icon={XCircle} onClick={handleAnular}>Anular / Devolver</Button>
            )}
        </div>
      </header>

      <div className={styles.gridContainer}>
        
        {/* INFO GENERAL */}
        <div className={styles.leftCol}>
            <Card className={styles.infoCard}>
                <div className={styles.statusRow}>
                    <span className={styles.label}>Estado</span>
                    <Badge variant={badgeVariant}>{estadoNombre}</Badge>
                </div>
                <div className={styles.infoRow}>
                    <Calendar size={18} className={styles.icon} />
                    <div>
                        <p className={styles.label}>Fecha</p>
                        <p className={styles.value}>{formatDate(venta.venta_fecha_hora)}</p>
                    </div>
                </div>
                <div className={styles.infoRow}>
                    <User size={18} className={styles.icon} />
                    <div>
                        <p className={styles.label}>Cliente</p>
                        <p className={styles.value}>
                            {venta.cliente 
                                ? `${venta.cliente.nombre} ${venta.cliente.apellido}` 
                                : 'Consumidor Final'}
                        </p>
                    </div>
                </div>
                <div className={styles.infoRow}>
                    <Box size={18} className={styles.icon} />
                    <div>
                        <p className={styles.label}>Vendedor</p>
                        <p className={styles.value}>{venta.empleado_nombre || '-'}</p>
                    </div>
                </div>
                <div className={styles.infoRow}>
                    <CreditCard size={18} className={styles.icon} />
                    <div>
                        <p className={styles.label}>Método de Pago</p>
                        <p className={styles.value} style={{textTransform: 'capitalize'}}>
                            {venta.venta_medio_pago}
                        </p>
                    </div>
                </div>
            </Card>
        </div>

        {/* DETALLE DE ÍTEMS */}
        <div className={styles.rightCol}>
            <Card>
                <h3 className={styles.sectionTitle}>Detalle de Ítems</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th style={{textAlign:'center'}}>Cant.</th>
                            <th style={{textAlign:'right'}}>Precio</th>
                            <th style={{textAlign:'right'}}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <span className={styles.itemName}>{item.nombre}</span>
                                    <span className={styles.itemType}>{item.tipo}</span>
                                </td>
                                <td style={{textAlign:'center'}}>{item.cantidad}</td>
                                <td style={{textAlign:'right'}}>{formatCurrency(item.precio)}</td>
                                <td style={{textAlign:'right', fontWeight: 500}}>
                                    {formatCurrency(item.precio * item.cantidad)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.footer}>
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
                    <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                        <span>Total</span>
                        <span>{formatCurrency(venta.venta_total)}</span>
                    </div>
                </div>
            </Card>
        </div>

      </div>
    </motion.div>
  );
};