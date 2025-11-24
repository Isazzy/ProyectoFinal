import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, ShoppingBag, Calendar, RefreshCw, X } from 'lucide-react';
import { ventasApi } from '../../api/ventasApi';
import { Card, Button, Badge, Input } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Ventas.module.css';

export const VentasList = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // CAMBIO: Inicializamos fecha vacía para ver TODO el historial al principio
  // O puedes dejarlo en 'hoy' pero permitir limpiar.
  const [dateFilter, setDateFilter] = useState(''); 
  
  const [stats, setStats] = useState({ hoy: 0, semana: 0, mes: 0 });

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        // Preparamos los parámetros. Si dateFilter es '', enviamos objeto vacío {}
        const params = dateFilter ? { fecha: dateFilter } : {};
        
        console.log("Pidiendo ventas con params:", params); // DEBUG

        const data = await ventasApi.getVentas(params);
        
        console.log("Respuesta API Ventas:", data); // DEBUG

        // DRF Pagination support: data.results o data directo
        const lista = data.results || data;
        setVentas(lista);
        
      } catch (error) {
        console.error('Error cargando ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVentas();
  }, [dateFilter]);

  // Cargar Resumen
  useEffect(() => {
      const fetchResumen = async () => {
          try {
              const data = await ventasApi.getResumenVentas(); 
              setStats(data);
          } catch (error) {
              console.error("Error resumen:", error);
          }
      };
      fetchResumen();
  }, []);

  const getStatusColor = (nombreEstado) => {
      const estado = nombreEstado?.toLowerCase() || '';
      if (estado.includes('pagado') || estado.includes('completado')) return 'success';
      if (estado.includes('pendiente')) return 'warning';
      if (estado.includes('anulado') || estado.includes('cancelado')) return 'danger';
      return 'default';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <h1>Ventas</h1>
        <Button icon={Plus} onClick={() => navigate('/ventas/nuevo')}>
          Nueva Venta
        </Button>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Ventas Hoy</p>
          <p className={styles.statValue} style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.hoy || 0)}
          </p>
        </Card>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Ventas Mes</p>
          <p className={styles.statValue} style={{ color: 'var(--accent)' }}>
            {formatCurrency(stats.mes || 0)}
          </p>
        </Card>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Total Histórico</p> 
          {/* Puedes usar otro dato aquí si quieres */}
          <p className={styles.statValue} style={{ color: 'var(--primary)' }}>
            {/* Placeholder o calculo local */}
            {ventas.length} ops.
          </p>
        </Card>
      </div>

      {/* Filtros */}
      <div className={styles.filters} style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20}}>
        <div style={{position: 'relative', flex: 1, maxWidth: 300}}>
            <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            icon={Calendar}
            placeholder="Filtrar por fecha"
            />
            {dateFilter && (
                <button 
                    onClick={() => setDateFilter('')}
                    style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#666'
                    }}
                    title="Ver todas"
                >
                    <X size={16} />
                </button>
            )}
        </div>
        {dateFilter && <span style={{fontSize:'0.9rem', color:'#666'}}>Viendo fecha: {dateFilter}</span>}
        {!dateFilter && <span style={{fontSize:'0.9rem', color:'#666'}}>Viendo: Todo el historial</span>}
      </div>

      {/* Tabla de Ventas */}
      <Card>
        {loading ? (
          <div className={styles.loading} style={{padding: 20, textAlign:'center'}}>
             <RefreshCw className="animate-spin" /> Cargando ventas...
          </div>
        ) : ventas.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {ventas.map(venta => {
                    const clienteNombre = venta.cliente 
                        ? `${venta.cliente.cliente_nombre || venta.cliente.nombre} ${venta.cliente.cliente_apellido || venta.cliente.apellido}`.trim()
                        : 'Consumidor Final';
                    
                    const estadoNombre = venta.estado_venta 
                        ? venta.estado_venta.estado_venta_nombre 
                        : 'Desconocido';
                    
                    return (
                    <tr key={venta.id}>
                        <td>#{venta.id}</td>
                        <td>{formatDate(venta.venta_fecha_hora)}</td>
                        
                        <td>{clienteNombre}</td>
                        
                        <td className={styles.total} style={{fontWeight:'bold'}}>
                            {formatCurrency(venta.venta_total)}
                        </td>
                        
                        <td>
                        <Badge variant={getStatusColor(estadoNombre)}>{estadoNombre}</Badge>
                        </td>
                        
                        <td style={{ textAlign: 'right' }}>
                        <button 
                            className={styles.actionBtn}
                            onClick={() => navigate(`/ventas/${venta.id}`)}
                            title="Ver Detalle"
                        >
                            <Eye size={18} />
                        </button>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} />
            <p>No se encontraron ventas.</p>
            {dateFilter && <Button variant="outline" onClick={() => setDateFilter('')} size="sm">Ver todo el historial</Button>}
          </div>
        )}
      </Card>
    </motion.div>
  );
};