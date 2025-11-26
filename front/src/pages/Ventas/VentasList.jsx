// ========================================
// src/pages/Ventas/VentasList.jsx
// ========================================
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Plus, Eye, ShoppingBag, Calendar, RefreshCw, 
    Search, X, DollarSign, TrendingUp 
} from 'lucide-react';
import { ventasApi } from '../../api/ventasApi';
import { Card, Button, Badge, Input } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Ventas.module.css';

// --- Sub-componente: Tarjeta de Estadística ---
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={styles.statCard}>
        <div className={styles.statIcon} style={{ backgroundColor: `${color}15`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
        </div>
    </div>
);

export const VentasList = () => {
  const navigate = useNavigate();
  
  // Estados de Datos
  const [ventas, setVentas] = useState([]);
  const [stats, setStats] = useState({ hoy: 0, mes: 0 });
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtros
  const [dateFilter, setDateFilter] = useState(''); // Vacío = Ver todo
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Cargar Datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Params para la API
        const params = dateFilter ? { fecha: dateFilter } : {};
        
        const [ventasData, resumenData] = await Promise.all([
            ventasApi.getVentas(params),
            ventasApi.getResumenVentas() // Dashboard de ventas
        ]);

        const lista = ventasData.results || ventasData;
        setVentas(lista);
        setStats(resumenData);

      } catch (error) {
        console.error('Error cargando módulo ventas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter]);

  // 2. Filtrado Local (Por nombre de cliente)
  const filteredVentas = useMemo(() => {
      return ventas.filter(v => {
          // CORRECCIÓN: Usar las propiedades correctas 'nombre' y 'apellido'
          const cliente = v.cliente 
            ? `${v.cliente.nombre} ${v.cliente.apellido}` 
            : 'Consumidor Final';
          
          return cliente.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [ventas, searchQuery]);

  // Helpers
  const handleClearFilters = () => {
      setDateFilter('');
      setSearchQuery('');
  };

  const getStatusColor = (nombreEstado) => {
      const estado = (nombreEstado || '').toLowerCase();
      if (estado.includes('pagado') || estado.includes('completado')) return 'success';
      if (estado.includes('pendiente')) return 'warning';
      if (estado.includes('devolución') || estado.includes('parcial')) return 'warning'; 
      if (estado.includes('anulado') || estado.includes('cancelado')) return 'danger';
      return 'default';
  };

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <div className={styles.topBar}>
        <div>
            <h1 className={styles.title}>Ventas</h1>
            <p className={styles.subtitle}>Historial de transacciones y facturación</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/ventas/nuevo')}>Nueva Venta</Button>
      </div>

      {/* STATS ROW */}
      

      {/* FILTROS */}
      <div className={styles.controlsContainer}>
          <div className={styles.searchBox}>
            <Input 
                placeholder="Buscar por cliente..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                icon={Search}
            />
          </div>

          <div className={styles.filtersGroup}>
              <div className={styles.dateWrapper}>
                  <Calendar size={18} className={styles.dateIcon}/>
                  <input 
                    type="date" 
                    className={styles.dateInput}
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                  />
              </div>
              
              {(dateFilter || searchQuery) && (
                  <button onClick={handleClearFilters} className={styles.clearBtn} title="Limpiar filtros">
                      <X size={18} />
                  </button>
              )}
          </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <Card className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingState}>
             <RefreshCw className="animate-spin" size={24}/> 
             <p>Cargando transacciones...</p>
          </div>
        ) : filteredVentas.length > 0 ? (
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
              {filteredVentas.map(venta => {
                // CORRECCIÓN: Renderizado del nombre del cliente
                const clienteNombre = venta.cliente 
                    ? `${venta.cliente.nombre} ${venta.cliente.apellido}`.trim()
                    : <span className={styles.consumerTag}>Consumidor Final</span>;
                
                const estadoNombre = venta.estado_venta?.estado_venta_nombre || 'Desconocido';
                const isCanceled = estadoNombre.toLowerCase().includes('anulado');

                return (
                  <motion.tr 
                    key={venta.id} 
                    className={`${styles.tableRow} ${isCanceled ? styles.rowCancelled : ''}`}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                  >
                    <td className={styles.idCell}>#{venta.id}</td>
                    <td className={styles.dateCell}>
                        {formatDate(venta.venta_fecha_hora)}
                        <span className={styles.timeLabel}>
                            {new Date(venta.venta_fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </td>
                    
                    <td className={styles.clientCell}>{clienteNombre}</td>
                    
                    <td className={styles.totalCell}>
                        {formatCurrency(venta.venta_total)}
                    </td>
                    
                    <td>
                      <Badge variant={getStatusColor(estadoNombre)}>{estadoNombre}</Badge>
                    </td>
                    
                    <td className={styles.actionsCell}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => navigate(`/ventas/${venta.id}`)}
                        title="Ver Detalle / Ticket"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconBox}><ShoppingBag size={40} /></div>
            <h3>No se encontraron ventas</h3>
            <p>Intenta cambiar los filtros o registra una nueva venta.</p>
            {dateFilter && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Ver todo el historial
                </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};