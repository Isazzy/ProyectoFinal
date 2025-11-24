import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, DollarSign, TrendingUp, TrendingDown, ShoppingCart, RefreshCw } from 'lucide-react';
import { useCaja } from '../../hooks/useCaja';
import { Card, Button, Input, Badge } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Caja.module.css'; // Definir estilos abajo

export const CajaPage = () => {
  const { caja, movimientos, loading, abrirCaja, cerrarCaja, refrescar } = useCaja();
  
  // Estado para formulario de apertura
  const [montoInicial, setMontoInicial] = useState("");
  
  // Estado para formulario de cierre
  const [observacion, setObservacion] = useState("");

  // --- VISTA 1: CAJA CERRADA (FORMULARIO APERTURA) ---
  if (!loading && !caja) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.centerContainer}>
        <Card className={styles.openCard}>
          <div className={styles.iconWrapper}>
            <Lock size={48} color="#64748b" />
          </div>
          <h2 className={styles.title}>Caja Cerrada</h2>
          <p className={styles.subtitle}>Ingrese el monto inicial en efectivo para comenzar las operaciones del día.</p>
          
          <div className={styles.formGroup}>
            <label>Monto Inicial</label>
            <Input 
                type="number" 
                value={montoInicial} 
                onChange={(e) => setMontoInicial(e.target.value)} 
                placeholder="0.00" 
                startIcon={DollarSign}
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
    );
  }

  // --- VISTA 2: CAJA ABIERTA (DASHBOARD) ---
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.dashboard}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
            <div className={styles.statusBadge}>
                <span className={styles.dot}></span> Caja Abierta
            </div>
            <h1 style={{margin:0}}>Control de Caja</h1>
            <p style={{color:'#666', fontSize:'0.9rem'}}>Apertura: {caja ? formatDate(caja.caja_fecha_hora_apertura) : '-'}</p>
        </div>
        <div style={{display:'flex', gap: 10}}>
            <Button variant="outline" onClick={refrescar} icon={RefreshCw}>Actualizar</Button>
            <Button variant="danger" onClick={() => cerrarCaja(observacion)} icon={Lock}>Cerrar Caja</Button>
        </div>
      </header>

      {/* TARJETAS DE RESUMEN */}
      {caja && (
        <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
                <p>Monto Inicial</p>
                <h3>{formatCurrency(caja.caja_monto_inicial)}</h3>
                <Unlock className={styles.cardIcon} color="#64748b"/>
            </Card>
            
            {/* Estos campos vienen del Serializer del Backend */}
            <Card className={styles.statCard}>
                <p>Ventas Efectivo</p>
                <h3 style={{color: '#16a34a'}}>+{formatCurrency(caja.total_ventas_efectivo)}</h3>
                <ShoppingCart className={styles.cardIcon} color="#16a34a"/>
            </Card>

            <Card className={styles.statCard}>
                <p>Gastos/Retiros</p>
                <h3 style={{color: '#ef4444'}}>-{formatCurrency(caja.total_egresos_manuales)}</h3>
                <TrendingDown className={styles.cardIcon} color="#ef4444"/>
            </Card>

            <Card className={`${styles.statCard} ${styles.balanceCard}`}>
                <p>Saldo en Caja (Físico)</p>
                <h1>{formatCurrency(caja.saldo_calculado_efectivo)}</h1>
                <DollarSign className={styles.cardIcon} color="#fff"/>
            </Card>
        </div>
      )}

      {/* LISTA DE MOVIMIENTOS */}
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
                        const isIngreso = mov.tipo === 'Venta' || mov.tipo === 'Ingreso';
                        return (
                            <tr key={idx}>
                                <td>{new Date(mov.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
                                <td>
                                    <Badge variant={isIngreso ? 'success' : 'danger'}>{mov.tipo}</Badge>
                                </td>
                                <td>{mov.descripcion}</td>
                                <td style={{textAlign:'right', fontWeight:'bold', color: isIngreso ? '#16a34a' : '#ef4444'}}>
                                    {isIngreso ? '+' : '-'}{formatCurrency(mov.monto)}
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

      {/* INPUT DE OBSERVACIÓN PARA CIERRE */}
      <div style={{marginTop: 20}}>
          <p style={{marginBottom:5, fontWeight:500}}>Observación de Cierre (Opcional):</p>
          <textarea 
            className={styles.textarea}
            placeholder="Ej: Faltaron $10, se retiró dinero para..."
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
      </div>

    </motion.div>
  );
};