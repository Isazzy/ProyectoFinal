// ========================================
// src/pages/Caja/CajaPage.jsx
// ========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Lock, Unlock, DollarSign, TrendingUp, TrendingDown, 
    ShoppingCart, RefreshCw, Plus, Minus, History as HistoryIcon,
    AlertCircle, Wallet
} from 'lucide-react';
import { useCaja } from '../../hooks/useCaja';
import { Card, Button, Input, Badge, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Caja.module.css'; 

// --- Sub-componente: Formulario de Movimiento ---
const MovimientoForm = ({ tipo, onSubmit, onClose }) => {
    const [monto, setMonto] = useState("");
    const [desc, setDesc] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!monto || !desc) return;
        setSubmitting(true);
        await onSubmit(desc, monto);
        setSubmitting(false);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.amountInputWrapper}>
                <label>Monto</label>
                <Input 
                    type="number" 
                    value={monto} 
                    onChange={e => setMonto(e.target.value)} 
                    startIcon={DollarSign}
                    autoFocus
                    min="0.01" 
                    step="0.01"
                    className={styles.largeInput}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Descripción / Motivo</label>
                <textarea 
                    className={styles.textarea} 
                    value={desc} 
                    onChange={e => setDesc(e.target.value)}
                    placeholder={tipo === 'ingreso' ? "Ej: Aporte de cambio chico" : "Ej: Compra insumos limpieza"}
                    rows={3}
                />
            </div>
            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button type="submit" variant={tipo === 'ingreso' ? 'primary' : 'danger'} loading={submitting}>
                    {tipo === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Egreso'}
                </Button>
            </div>
        </form>
    );
};

// --- Sub-componente: Tabla de Historial ---
const HistorialTable = ({ historial, loading }) => {
    if (loading && (!historial || historial.length === 0)) return <div className={styles.loadingState}><RefreshCw className="animate-spin"/> Cargando historial...</div>;
    if (!historial || historial.length === 0) return <div className={styles.emptyState}><p>No hay cierres de caja anteriores.</p></div>;

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableScroll}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Apertura</th>
                            <th>Cierre</th>
                            <th>Monto Inicial</th>
                            <th>Saldo Final</th>
                            <th>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div className={styles.dateCell}>
                                        <span>{formatDate(c.caja_fecha_hora_apertura)}</span>
                                        <small>{new Date(c.caja_fecha_hora_apertura).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                                    </div>
                                </td>
                                <td>
                                    {c.caja_fecha_hora_cierre 
                                        ? <span className={styles.dateCell}>
                                            {formatDate(c.caja_fecha_hora_cierre)}
                                            <small>{new Date(c.caja_fecha_hora_cierre).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                                        </span>
                                        : <Badge variant="warning">Abierta</Badge>
                                    }
                                </td>
                                <td>{formatCurrency(c.caja_monto_inicial)}</td>
                                <td><span className={styles.totalAmount}>{c.caja_saldo_final !== null ? formatCurrency(c.caja_saldo_final) : '-'}</span></td>
                                <td>{c.empleado?.first_name || c.empleado?.user?.username || 'Usuario'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Componente Principal ---
export const CajaPage = () => {
  const { 
      caja, movimientos, historial, loading, 
      abrirCaja, cerrarCaja, refrescar, 
      registrarIngreso, registrarEgreso, fetchHistorial 
  } = useCaja();
  
  const [montoInicial, setMontoInicial] = useState("");
  const [observacion, setObservacion] = useState("");
  const [modalMovimiento, setModalMovimiento] = useState({ open: false, tipo: null });
  const [showHistory, setShowHistory] = useState(false);

  const handleOpenHistory = () => {
      fetchHistorial();
      setShowHistory(true);
  };

  // --- VISTA 1: CAJA CERRADA ---
  if (!loading && !caja) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.headerSimple}>
           <h1>Gestión de Caja</h1>
           <Button variant="outline" onClick={handleOpenHistory} icon={HistoryIcon}>Historial de Cierres</Button>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.centerWrapper}>
            <Card className={styles.openCard}>
                <div className={styles.iconCircle}>
                    <Lock size={40} />
                </div>
                <h2 className={styles.cardTitle}>Caja Cerrada</h2>
                <p className={styles.cardSubtitle}>Inicia el turno ingresando el dinero base en caja.</p>
                
                <div className={styles.openForm}>
                    <Input 
                        type="number" 
                        label="Monto Inicial ($)"
                        value={montoInicial} 
                        onChange={(e) => setMontoInicial(e.target.value)} 
                        placeholder="0.00" 
                        startIcon={DollarSign}
                        className={styles.largeInput}
                        autoFocus
                    />
                    <Button 
                        fullWidth 
                        size="lg" 
                        onClick={() => abrirCaja(montoInicial || 0)}
                        disabled={loading}
                        style={{marginTop: 20}}
                    >
                        {loading ? 'Abriendo...' : 'Abrir Caja'}
                    </Button>
                </div>
            </Card>
        </motion.div>

        <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Historial de Cajas">
            <HistorialTable historial={historial} loading={loading} />
        </Modal>
      </div>
    );
  }

  // --- VISTA 2: CAJA ABIERTA (DASHBOARD) ---
  
  // Cálculo seguro de totales
  const totalEgresos = parseFloat(caja?.total_egresos_manuales || 0) + parseFloat(caja?.total_compras_efectivo || 0);
  const totalVentas = parseFloat(caja?.total_ventas_efectivo || 0);

  // Combinar movimientos API con el registro de apertura para visualización
  const movimientosDisplay = [
      ...movimientos,
      // Agregamos la apertura al final (ya que la lista suele venir ordenada por fecha desc)
      {
          id: 'apertura-inicial',
          tipo: 'Apertura',
          descripcion: 'Saldo inicial de apertura de caja',
          monto: caja?.caja_monto_inicial || 0,
          fecha: caja?.caja_fecha_hora_apertura
      }
  ];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.pageContainer}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
            <div className={styles.statusBadge}>
                <span className={styles.pulseDot}></span> Caja Abierta
            </div>
            <h1 className={styles.title}>Control de Caja</h1>
            <p className={styles.subtitle}>
                Apertura: {caja ? `${formatDate(caja.caja_fecha_hora_apertura)} a las ${new Date(caja.caja_fecha_hora_apertura).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}` : '-'}
            </p>
        </div>
        <div className={styles.headerActions}>
            <Button variant="outline" onClick={handleOpenHistory} icon={HistoryIcon}>Historial</Button>
            <Button variant="secondary" onClick={refrescar} icon={RefreshCw}>Actualizar</Button>
        </div>
      </header>

      {/* KPI CARDS */}
      {caja && (
        <div className={styles.statsGrid}>
            {/* 1. Monto Inicial */}
            <Card className={styles.statCard}>
                <div className={styles.statHeader}>
                    <span className={styles.statLabel}>Monto Inicial</span>
                    <div className={styles.iconBox}><Unlock size={18}/></div>
                </div>
                <div className={styles.statValue}>{formatCurrency(caja.caja_monto_inicial)}</div>
            </Card>
            
            {/* 2. Ingresos (Ventas Efectivo) */}
            <Card className={styles.statCard}>
                <div className={styles.statHeader}>
                    <span className={styles.statLabel}>Ventas (Efectivo)</span>
                    <div className={`${styles.iconBox} ${styles.successIcon}`}><TrendingUp size={18}/></div>
                </div>
                <div className={`${styles.statValue} ${styles.textSuccess}`}>+{formatCurrency(totalVentas)}</div>
                {parseFloat(caja.total_ingresos_manuales) > 0 && (
                     <small className={styles.statSubtext}>+ {formatCurrency(caja.total_ingresos_manuales)} otros ing.</small>
                )}
            </Card>

            {/* 3. Egresos Totales */}
            <Card className={styles.statCard}>
                <div className={styles.statHeader}>
                    <span className={styles.statLabel}>Total Salidas</span>
                    <div className={`${styles.iconBox} ${styles.dangerIcon}`}><TrendingDown size={18}/></div>
                </div>
                <div className={`${styles.statValue} ${styles.textDanger}`}>-{formatCurrency(totalEgresos)}</div>
                <small className={styles.statSubtext}>Compras y Retiros</small>
            </Card>

            {/* 4. SALDO FINAL (Highlight) */}
            <Card className={`${styles.statCard} ${styles.balanceCard}`}>
                <div className={styles.statHeader}>
                    <span className={styles.balanceLabel}>Saldo en Caja</span>
                    <div className={styles.balanceIcon}><Wallet size={20}/></div>
                </div>
                <div className={styles.balanceValue}>{formatCurrency(caja.saldo_calculado_efectivo)}</div>
                <small className={styles.balanceSubtext}>Dinero físico esperado</small>
            </Card>
        </div>
      )}

      <div className={styles.mainContentGrid}>
        
        {/* COLUMNA IZQUIERDA: MOVIMIENTOS */}
        <div className={styles.leftCol}>
            <div className={styles.sectionHeader}>
                <h3>Movimientos del Turno</h3>
                <div className={styles.quickActions}>
                    <Button size="sm" variant="outline" icon={Plus} onClick={() => setModalMovimiento({open: true, tipo: 'ingreso'})} style={{color: '#16a34a', borderColor: '#16a34a'}}>
                        Ingreso
                    </Button>
                    <Button size="sm" variant="outline" icon={Minus} onClick={() => setModalMovimiento({open: true, tipo: 'egreso'})} style={{color: '#ef4444', borderColor: '#ef4444'}}>
                        Egreso
                    </Button>
                </div>
            </div>

            <Card className={styles.tableCard}>
                {movimientosDisplay.length > 0 ? (
                    <div className={styles.tableScroll}>
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
                                {movimientosDisplay.map((mov, idx) => {
                                    const isApertura = mov.tipo === 'Apertura';
                                    const isPositivo = mov.tipo === 'Venta' || mov.tipo === 'Ingreso' || isApertura;
                                    
                                    // Badge Variant
                                    let badgeVar = 'default';
                                    if (isApertura) badgeVar = 'info';
                                    else if (isPositivo) badgeVar = 'success';
                                    else badgeVar = 'danger';

                                    return (
                                        <tr key={idx} style={isApertura ? {backgroundColor: '#f8fafc'} : {}}>
                                            <td className={styles.timeCell}>
                                                {mov.fecha ? new Date(mov.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '-'}
                                            </td>
                                            <td>
                                                <Badge variant={badgeVar}>{mov.tipo}</Badge>
                                            </td>
                                            <td className={styles.descCell}>{mov.descripcion}</td>
                                            <td style={{textAlign:'right', fontWeight:'bold', color: isPositivo ? '#16a34a' : '#ef4444'}}>
                                                {isPositivo ? '+' : '-'}{formatCurrency(mov.monto)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No hay movimientos registrados en este turno.</p>
                    </div>
                )}
            </Card>
        </div>

        {/* COLUMNA DERECHA: CIERRE DE CAJA */}
        <div className={styles.rightCol}>
            <Card className={styles.closeCard}>
                <div className={styles.closeHeader}>
                    <h3><Lock size={20}/> Arqueo de Caja</h3>
                    <p>Finalizar el turno actual.</p>
                </div>
                
                <div className={styles.closeForm}>
                    <label>Observaciones del Cierre</label>
                    <textarea 
                        className={styles.textarea}
                        placeholder="Diferencias, billetes rotos, notas..."
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                    />
                    
                    <div className={styles.closeAlert}>
                        <AlertCircle size={18}/>
                        <span>Verifique que el dinero físico coincida con el saldo esperado: <strong>{formatCurrency(caja?.saldo_calculado_efectivo)}</strong></span>
                    </div>

                    <Button 
                        fullWidth 
                        variant="danger" 
                        onClick={() => cerrarCaja(observacion)} 
                        icon={Lock}
                        size="lg"
                    >
                        Cerrar Caja
                    </Button>
                </div>
            </Card>
        </div>

      </div>

      {/* MODALES */}
      <Modal isOpen={modalMovimiento.open} onClose={() => setModalMovimiento({...modalMovimiento, open: false})} title={modalMovimiento.tipo === 'ingreso' ? 'Registrar Ingreso Extra' : 'Registrar Gasto/Retiro'}>
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