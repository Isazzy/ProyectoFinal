// ========================================
// src/pages/Caja/CajaPage.jsx
// ========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
// CORRECCIÓN CLAVE: Renombrar History a HistoryIcon para evitar conflicto con window.History
import { 
    Lock, Unlock, DollarSign, TrendingUp, TrendingDown, 
    ShoppingCart, RefreshCw, Plus, Minus, History as HistoryIcon 
} from 'lucide-react';
import { useCaja } from '../../hooks/useCaja';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Caja.module.css'; 

// --- Sub-componente: Formulario de Movimiento ---
const MovimientoForm = ({ tipo, onSubmit, onClose }) => {
    const [monto, setMonto] = useState("");
    const [desc, setDesc] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!monto || !desc) return;
        // Enviamos descripción y monto al hook
        onSubmit(desc, monto);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <Input 
                label="Monto" 
                type="number" 
                value={monto} 
                onChange={e => setMonto(e.target.value)} 
                startIcon={DollarSign}
                autoFocus
                min="0.01" 
                step="any"
            />
            <div style={{marginBottom: 15}}>
                <label style={{display:'block', marginBottom:5, fontWeight:500}}>Descripción</label>
                <textarea 
                    className={styles.textarea} 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)}
                    placeholder={tipo === 'ingreso' ? "Ej: Aporte de cambio" : "Ej: Compra artículos limpieza"}
                    rows={3}
                />
            </div>
            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant={tipo === 'ingreso' ? 'primary' : 'danger'}>
                    {tipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
                </Button>
            </div>
        </form>
    );
};

// --- Sub-componente: Tabla de Historial ---
const HistorialTable = ({ historial, loading }) => {
    if (loading && (!historial || historial.length === 0)) return <p style={{padding:20}}>Cargando historial...</p>;
    if (!historial || historial.length === 0) return <p style={{padding:20}}>No hay cierres de caja anteriores.</p>;

    return (
        <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Apertura</th>
                        <th>Cierre</th>
                        <th>Inicial</th>
                        <th>Final</th>
                        <th>Responsable</th>
                    </tr>
                </thead>
                <tbody>
                    {historial.map(c => (
                        <tr key={c.id}>
                            <td>{formatDate(c.caja_fecha_hora_apertura)}</td>
                            <td>
                                {c.caja_fecha_hora_cierre 
                                    ? formatDate(c.caja_fecha_hora_cierre) 
                                    : <Badge variant="warning">Abierta</Badge>
                                }
                            </td>
                            <td>{formatCurrency(c.caja_monto_inicial)}</td>
                            <td style={{fontWeight:'bold'}}>
                                {c.caja_saldo_final !== null ? formatCurrency(c.caja_saldo_final) : '-'}
                            </td>
                            <td>{c.empleado?.nombre || c.empleado?.user?.username || 'Usuario'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Componente Principal: CajaPage ---
export const CajaPage = () => {
  const { 
      caja, movimientos, historial, loading, 
      abrirCaja, cerrarCaja, refrescar, 
      registrarIngreso, registrarEgreso, fetchHistorial 
  } = useCaja();
  
  // Estados locales
  const [montoInicial, setMontoInicial] = useState("");
  const [observacion, setObservacion] = useState("");
  const [modalMovimiento, setModalMovimiento] = useState({ open: false, tipo: null }); // 'ingreso' | 'egreso'
  const [showHistory, setShowHistory] = useState(false);

  const handleOpenHistory = () => {
      fetchHistorial();
      setShowHistory(true);
  };

  // --- VISTA 1: CAJA CERRADA (APERTURA) ---
  if (!loading && !caja) {
    return (
      <div style={{padding: 20}}>
        {/* Botón Historial flotante */}
        <div style={{display:'flex', justifyContent: 'flex-end', marginBottom: 20}}>
           <Button variant="outline" onClick={handleOpenHistory} icon={HistoryIcon}>Historial</Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.centerContainer}>
            <Card className={styles.openCard}>
                <div className={styles.iconWrapper}>
                    <Lock size={48} color="#64748b" />
                </div>
                <h2 className={styles.title}>Caja Cerrada</h2>
                <p className={styles.subtitle}>Ingrese el monto inicial en efectivo para comenzar.</p>
                
                <div className={styles.formGroup}>
                    <Input 
                        type="number" 
                        value={montoInicial} 
                        onChange={(e) => setMontoInicial(e.target.value)} 
                        placeholder="0.00" 
                        startIcon={DollarSign}
                        label="Monto Inicial"
                    />
                </div>

                <Button 
                    fullWidth 
                    size="lg" 
                    onClick={() => abrirCaja(montoInicial || 0)}
                    disabled={loading}
                >
                    {loading ? 'Abriendo...' : 'Abrir Caja'}
                </Button>
            </Card>
        </motion.div>

        {/* MODAL HISTORIAL (Disponible también aquí) */}
        <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Historial de Cajas">
            <HistorialTable historial={historial} loading={loading} />
        </Modal>
      </div>
    );
  }

  // --- VISTA 2: CAJA ABIERTA (DASHBOARD) ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.dashboard}>
      
      <header className={styles.header}>
        <div>
            <div className={styles.statusBadge}>
                <span className={styles.dot}></span> Caja Abierta
            </div>
            <h1 style={{margin:0}}>Control de Caja</h1>
            <p style={{color:'#666', fontSize:'0.9rem'}}>Apertura: {caja ? formatDate(caja.caja_fecha_hora_apertura) : '-'}</p>
        </div>
        <div style={{display:'flex', gap: 10}}>
            <Button variant="outline" icon={Plus} onClick={() => setModalMovimiento({open: true, tipo: 'ingreso'})} style={{color: '#16a34a', borderColor: '#16a34a'}}>
                Ingreso
            </Button>
            <Button variant="outline" icon={Minus} onClick={() => setModalMovimiento({open: true, tipo: 'egreso'})} style={{color: '#ef4444', borderColor: '#ef4444'}}>
                Egreso
            </Button>
            
            <div style={{width: 1, background: '#ddd', margin: '0 5px'}}></div>
            
            {/* CORRECCIÓN: Usamos HistoryIcon */}
            <Button variant="outline" onClick={handleOpenHistory} icon={HistoryIcon}>Historial</Button>
            <Button variant="secondary" onClick={refrescar} icon={RefreshCw}>Actualizar</Button>
            <Button variant="danger" onClick={() => cerrarCaja(observacion)} icon={Lock}>Cerrar Caja</Button>
        </div>
      </header>

      {caja && (
        <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
                <p>Monto Inicial</p>
                <h3>{formatCurrency(caja.caja_monto_inicial)}</h3>
                <Unlock className={styles.cardIcon} color="#64748b"/>
            </Card>
            
            <Card className={styles.statCard}>
                <p>Ventas Efectivo</p>
                <h3 style={{color: '#16a34a'}}>+{formatCurrency(caja.total_ventas_efectivo)}</h3>
                <ShoppingCart className={styles.cardIcon} color="#16a34a"/>
            </Card>

            <Card className={styles.statCard}>
                <p>Gastos/Retiros</p>
                <h3 style={{color: '#ef4444'}}>-{formatCurrency(parseFloat(caja.total_egresos_manuales || 0) + parseFloat(caja.total_compras_efectivo || 0))}</h3>
                <TrendingDown className={styles.cardIcon} color="#ef4444"/>
            </Card>

            <Card className={`${styles.statCard} ${styles.balanceCard}`}>
                <p>Saldo Físico (Efectivo)</p>
                <h1>{formatCurrency(caja.saldo_calculado_efectivo)}</h1>
                <DollarSign className={styles.cardIcon} color="#fff"/>
            </Card>
        </div>
      )}

      <Card className={styles.movimientosCard}>
        <h3>Movimientos del Turno</h3>
        {movimientos.length > 0 ? (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Descripción</th>
                        <th style={{textAlign:'right'}}>Monto</th>
                    </tr>
                </thead>
                <tbody>
                    {movimientos.map((mov, idx) => {
                        const isPositivo = mov.tipo === 'Venta' || mov.tipo === 'Ingreso';
                        return (
                            <tr key={idx}>
                                <td>{new Date(mov.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                <td>
                                    <Badge variant={isPositivo ? 'success' : 'danger'}>{mov.tipo}</Badge>
                                </td>
                                <td>{mov.descripcion}</td>
                                <td style={{textAlign:'right', fontWeight:'bold', color: isPositivo ? '#16a34a' : '#ef4444'}}>
                                    {isPositivo ? '+' : '-'}{formatCurrency(mov.monto)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        ) : (
            <p style={{textAlign:'center', padding: 20, color:'#999'}}>No hay movimientos registrados aún.</p>
        )}
      </Card>

      <div style={{marginTop: 20}}>
          <p style={{marginBottom:5, fontWeight:500}}>Observación de Cierre (Opcional):</p>
          <textarea 
            className={styles.textarea}
            placeholder="Ej: Faltaron $10, se retiró dinero para..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
      </div>

      {/* MODALES */}
      <Modal 
        isOpen={modalMovimiento.open} 
        onClose={() => setModalMovimiento({...modalMovimiento, open: false})}
        title={modalMovimiento.tipo === 'ingreso' ? 'Registrar Ingreso Manual' : 'Registrar Egreso/Gasto'}
      >
          <MovimientoForm 
            tipo={modalMovimiento.tipo}
            onSubmit={modalMovimiento.tipo === 'ingreso' ? registrarIngreso : registrarEgreso}
            onClose={() => setModalMovimiento({...modalMovimiento, open: false})}
          />
      </Modal>

      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Historial de Cajas">
          <HistorialTable historial={historial} loading={loading} />
      </Modal>

    </motion.div>
  );
};