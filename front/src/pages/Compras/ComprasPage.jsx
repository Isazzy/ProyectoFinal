// ========================================
// src/pages/Compras/ComprasPage.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORTAR useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Truck, Package, ShoppingCart, Eye, 
    Calendar, User, CreditCard, Search 
} from 'lucide-react';
import { useCompras } from '../../hooks/useCompras';
import { Card, Button, Badge, Modal, Input } from '../../components/ui';
import { CompraForm } from './CompraForm'; 
import { ProveedorCrud } from './ProveedoresCrud'; 
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/Compras.module.css';

export const ComprasPage = () => {
    const navigate = useNavigate(); // <--- 2. INICIALIZAR HOOK
    const { compras, loading, fetchCompras, fetchProveedores } = useCompras();
    const [activeTab, setActiveTab] = useState('compras');
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCompras();
        fetchProveedores();
    }, [fetchCompras, fetchProveedores]);

    const filteredCompras = compras.filter(c => 
        c.proveedor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- SUB-COMPONENTES DE RENDERIZADO ---

    const ComprasTable = () => (
        <div className={styles.tableContainer}>
            <div className={styles.filtersBar}>
                <div className={styles.searchWrapper}>
                    <Input 
                        icon={Search} 
                        placeholder="Buscar por proveedor..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button icon={Plus} onClick={() => setModalOpen(true)}>
                    Registrar Compra
                </Button>
            </div>

            {loading ? (
                <div className={styles.loadingState}>Cargando historial...</div>
            ) : filteredCompras.length === 0 ? (
                <div className={styles.emptyState}>
                    <ShoppingCart size={48} strokeWidth={1.5} />
                    <h3>No hay compras registradas</h3>
                    <p>Comienza registrando el abastecimiento de insumos.</p>
                    <Button variant="outline" onClick={() => setModalOpen(true)}>Nueva Compra</Button>
                </div>
            ) : (
                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Proveedor</th>
                                <th>Total</th>
                                <th>Método</th>
                                <th>Registró</th>
                                <th style={{textAlign: 'right'}}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompras.map(c => (
                                <tr key={c.id} className={styles.tableRow}>
                                    <td>
                                        <div className={styles.dateCell}>
                                            <Calendar size={14} className={styles.cellIcon}/>
                                            <span>{c.compra_fecha}</span>
                                        </div>
                                    </td>
                                    <td style={{color:'#64748b', fontSize:'0.9rem'}}>
                                        {c.compra_hora?.slice(0, 5)}
                                    </td>
                                    <td>
                                        <div className={styles.providerCell}>
                                            <Truck size={16} className={styles.providerIcon}/>
                                            {c.proveedor}
                                        </div>
                                    </td>
                                    <td><span style={{fontWeight: 600}}>{formatCurrency(c.compra_total)}</span></td>
                                    <td>
                                        <Badge variant={c.compra_metodo_pago === 'efectivo' ? 'success' : 'info'} size="sm">
                                            {c.compra_metodo_pago}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <User size={14} />
                                            {c.empleado?.first_name || c.empleado?.username || '-'}
                                        </div>
                                    </td>
                                    <td style={{textAlign: 'right'}}>
                                        {/* 3. AGREGAR NAVEGACIÓN AL CLICK */}
                                        <button 
                                            className={styles.actionBtn} 
                                            title="Ver Detalle"
                                            onClick={() => navigate(`/compras/${c.id}`)}
                                        >
                                            <Eye size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* HEADER PRINCIPAL */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gestión de Compras</h1>
                    <p className={styles.subtitle}>Control de gastos y abastecimiento de stock</p>
                </div>
            </header>

            {/* NAVEGACIÓN DE PESTAÑAS */}
            <div className={styles.tabsContainer}>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'compras' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('compras')}
                >
                    <ShoppingCart size={18} /> Historial de Compras
                </button>
                <button 
                    className={`${styles.tabBtn} ${activeTab === 'proveedores' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('proveedores')}
                >
                    <Package size={18} /> Base de Proveedores
                </button>
            </div>

            {/* CONTENIDO DINÁMICO */}
            <Card className={styles.contentCard}>
                <AnimatePresence mode='wait'>
                    {activeTab === 'compras' ? (
                        <motion.div 
                            key="compras"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ComprasTable />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="proveedores"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ProveedorCrud />
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* MODAL DE COMPRA */}
            <Modal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                title="Nueva Orden de Compra"
            >
                <CompraForm onClose={() => {
                    setModalOpen(false);
                    fetchCompras(); 
                }} />
            </Modal>

        </motion.div>
    );
};