// ========================================
// src/pages/Compras/CompraDetail.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Printer, Truck, Calendar, 
    Clock, User, CreditCard, Box, Package, Tag 
} from 'lucide-react';
import { comprasApi } from '../../api/comprasApi';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CompraDetail.module.css';

export const CompraDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompra = async () => {
      try {
        const data = await comprasApi.getCompraDetail(id);
        setCompra(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la orden de compra.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompra();
  }, [id]);

  if (loading) return <div className={styles.loading}>Cargando orden...</div>;
  if (error || !compra) return <div className={styles.error}>{error || 'Compra no encontrada'}</div>;

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      
      <header className={styles.header}>
        <div className={styles.headerLeft}>
            <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/compras')}>
                Volver
            </Button>
            <h1>Orden de Compra #{compra.id}</h1>
        </div>
      </header>

      <div className={styles.contentGrid}>
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className={styles.leftCol}>
            <Card className={styles.infoCard}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Proveedor</h3>
                </div>
                <div className={styles.infoBody}>
                    <div className={styles.mainInfo}>
                        <div className={styles.iconBox}><Truck size={24} /></div>
                        <div>
                            <span className={styles.providerName}>{compra.proveedor}</span>
                            <span className={styles.providerLabel}>Proveedor Registrado</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className={styles.infoCard}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Detalles de Emisión</h3>
                </div>
                <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}><Calendar size={16}/></div>
                        <div className={styles.detailContent}>
                            <span className={styles.label}>Fecha</span>
                            <span className={styles.value}>{compra.compra_fecha}</span>
                        </div>
                    </div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}><Clock size={16}/></div>
                        <div className={styles.detailContent}>
                            <span className={styles.label}>Hora</span>
                            <span className={styles.value}>{compra.compra_hora}</span>
                        </div>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}><User size={16}/></div>
                        <div className={styles.detailContent}>
                            <span className={styles.label}>Recibido por</span>
                            {/* CORRECCIÓN: Usar empleado_nombre */}
                            <span className={styles.value}>{compra.empleado_nombre || 'Desconocido'}</span>
                        </div>
                    </div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}><Box size={16}/></div>
                        <div className={styles.detailContent}>
                            <span className={styles.label}>Caja Afectada</span>
                            <span className={styles.value}>{compra.caja}</span>
                        </div>
                    </div>
                    <div className={styles.detailRow}>
                        <div className={styles.detailIcon}><CreditCard size={16}/></div>
                        <div className={styles.detailContent}>
                            <span className={styles.label}>Método de Pago</span>
                            <Badge variant={compra.compra_metodo_pago === 'efectivo' ? 'success' : 'info'} size="sm">
                                {compra.compra_metodo_pago.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className={styles.rightCol}>
            <Card className={styles.itemsCard}>
                <div className={styles.itemsHeader}>
                    <h2>Ítems Adquiridos</h2>
                    <span className={styles.itemsCount}>{compra.detalles.length} ítems</span>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{width: '40%'}}>Descripción</th>
                            <th style={{textAlign: 'center'}}>Tipo</th>
                            <th style={{textAlign: 'center'}}>Cant.</th>
                            <th style={{textAlign: 'right'}}>Costo Unit.</th>
                            <th style={{textAlign: 'right'}}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compra.detalles.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <span className={styles.itemName}>{item.item_nombre}</span>
                                    <span className={styles.itemUnit}>({item.unidad})</span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    {item.item_tipo === 'Insumo' ? (
                                        <Badge variant="secondary" size="sm" icon={Package}>Insumo</Badge>
                                    ) : (
                                        <Badge variant="info" size="sm" icon={Tag}>Producto</Badge>
                                    )}
                                </td>
                                <td style={{textAlign: 'center', fontWeight: 500}}>
                                    {parseFloat(item.detalle_compra_cantidad)}
                                </td>
                                <td style={{textAlign: 'right'}} className={styles.monoFont}>
                                    {formatCurrency(item.detalle_compra_precio_unitario)}
                                </td>
                                <td style={{textAlign: 'right', fontWeight: 700}} className={styles.monoFont}>
                                    {formatCurrency(item.detalle_compra_cantidad * item.detalle_compra_precio_unitario)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.footerTotal}>
                    <div className={styles.totalLabel}>Total Compra</div>
                    <div className={styles.totalAmount}>{formatCurrency(compra.compra_total)}</div>
                </div>
            </Card>
        </div>

      </div>
    </motion.div>
  );
};