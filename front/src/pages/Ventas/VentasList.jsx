// ========================================
// src/pages/Ventas/VentasList.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, ShoppingBag, Calendar } from 'lucide-react';
import { ventasApi } from '../../api/ventasApi';
import { Card, Button, Badge, Input } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from '../../styles/Ventas.module.css';

export const VentasList = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ hoy: 0, semana: 0, mes: 0 });

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const data = await ventasApi.getVentas({ fecha: dateFilter });
        setVentas(data.results || data);
        // Mock stats
        setStats({ hoy: 11000, semana: 45200, mes: 189500 });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [dateFilter]);

  const statusColors = {
    pagado: 'success',
    pendiente: 'warning',
    anulado: 'danger',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <h1>Ventas</h1>
        <Button icon={Plus} onClick={() => navigate('/ventas/nuevo')}>
          Nueva Venta
        </Button>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Ventas Hoy</p>
          <p className={styles.statValue} style={{ color: 'var(--success)' }}>
            {formatCurrency(stats.hoy)}
          </p>
        </Card>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Ventas Semana</p>
          <p className={styles.statValue} style={{ color: 'var(--primary)' }}>
            {formatCurrency(stats.semana)}
          </p>
        </Card>
        <Card className={styles.statCard}>
          <p className={styles.statLabel}>Ventas Mes</p>
          <p className={styles.statValue} style={{ color: 'var(--accent)' }}>
            {formatCurrency(stats.mes)}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <div className={styles.filters}>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          icon={Calendar}
        />
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : ventas.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(venta => (
                <tr key={venta.id}>
                  <td>{formatDate(venta.fecha)}</td>
                  <td>{venta.cliente_nombre || venta.cliente}</td>
                  <td className={styles.total}>{formatCurrency(venta.total)}</td>
                  <td>
                    <Badge variant={statusColors[venta.estado]}>{venta.estado}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => navigate(`/ventas/${venta.id}`)}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} />
            <p>No hay ventas para esta fecha</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};