// ========================================
// src/pages/Compras/ComprasPage.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Truck, Package, ShoppingCart, Eye } from 'lucide-react';
import { useCompras } from '../../hooks/useCompras';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { CompraForm } from './CompraForm'; 
import { ProveedorCrud } from './ProveedoresCrud'; 
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Compras.module.css';

export const ComprasPage = () => {
    const { compras, loading, fetchCompras, fetchProveedores } = useCompras();
    const [activeView, setActiveView] = useState('compras'); // 'compras' | 'proveedores'
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        fetchCompras();
        fetchProveedores(); 
    }, [fetchCompras, fetchProveedores]);

    const renderComprasList = () => (
        <Card>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 20}}>
                <h3>Historial de Compras</h3>
                <Button icon={Plus} onClick={() => setModalOpen(true)}>Registrar Compra</Button>
            </div>
            {compras.length === 0 ? <p>No hay compras registradas.</p> : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Proveedor</th>
                            <th>Total</th>
                            <th>Método</th>
                            <th>Registró</th>
                            <th style={{textAlign: 'right'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.map(c => (
                            <tr key={c.id}>
                                {/* CORRECCIÓN: Usar campos separados */}
                                <td>{c.compra_fecha}</td>
                                <td style={{color:'#64748b', fontSize:'0.9rem'}}>{c.compra_hora}</td>
                                
                                <td><Truck size={16} style={{marginRight: 8}}/>{c.proveedor}</td>
                                <td><span style={{fontWeight: 600}}>{formatCurrency(c.compra_total)}</span></td>
                                <td><Badge variant={c.compra_metodo_pago === 'efectivo' ? 'primary' : 'outline'}>{c.compra_metodo_pago}</Badge></td>
                                <td>{c.empleado?.first_name || c.empleado?.username || '-'}</td>
                                <td style={{textAlign: 'right'}}>
                                    <Button size="sm" variant="ghost" onClick={() => console.log('Ver detalle', c.id)}><Eye size={16}/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Card>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* TABS DE NAVEGACIÓN */}
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>Módulo de Compras</h1>
                <div className={styles.tabs}>
                    <Button variant={activeView === 'compras' ? 'primary' : 'secondary'} onClick={() => setActiveView('compras')} icon={ShoppingCart}>Compras</Button>
                    <Button variant={activeView === 'proveedores' ? 'primary' : 'secondary'} onClick={() => setActiveView('proveedores')} icon={Package}>Proveedores</Button>
                </div>
            </div>

            {loading ? <p>Cargando datos del módulo...</p> : (
                <div className={styles.contentArea}>
                    {activeView === 'compras' && renderComprasList()}
                    {activeView === 'proveedores' && <ProveedorCrud />}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Orden de Compra">
                <CompraForm onClose={() => setModalOpen(false)} />
            </Modal>
        </motion.div>
    );
};