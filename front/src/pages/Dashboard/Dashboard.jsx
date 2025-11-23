// ========================================
// src/pages/Dashboard/Dashboard.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, CreditCard, Users, Package, Plus, 
  TrendingUp, Clock, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTurnos } from '../../hooks/useTurnos';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import styles from '../../styles/Dashboard.module.css';

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <Card className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
      {trend && (
        <div className={styles.statTrend} style={{ color: trend > 0 ? 'var(--success)' : 'var(--danger)' }}>
          <TrendingUp size={16} />
          <span>{trend > 0 ? '+' : ''}{trend}%</span>
        </div>
      )}
    </Card>
  </motion.div>
);

// Turno Item Component
const TurnoItem = ({ turno, onClick }) => {
  const statusColors = {
    pendiente: 'warning',
    confirmado: 'primary',
    completado: 'success',
    cancelado: 'danger',
  };

  return (
    <motion.div
      className={styles.turnoItem}
      whileHover={{ x: 4 }}
      onClick={onClick}
    >
      <div className={styles.turnoTime}>
        <span className={styles.timeText}>{formatTime(turno.hora)}</span>
      </div>
      <div className={styles.turnoInfo}>
        <p className={styles.turnoCliente}>{turno.cliente_nombre || turno.cliente}</p>
        <p className={styles.turnoServicios}>
          {turno.servicios?.map(s => s.nombre || s).join(', ')}
        </p>
      </div>
      <Badge variant={statusColors[turno.estado]}>{turno.estado}</Badge>
    </motion.div>
  );
};

// Main Dashboard Component
export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { turnos, fetchTurnos, loading } = useTurnos();
  
  const [stats, setStats] = useState({
    turnosHoy: 0,
    ventasDia: 0,
    clientesNuevos: 0,
    stockCritico: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchTurnos({ fecha: today });
    
    // Mock stats - replace with real API calls
    setStats({
      turnosHoy: 8,
      ventasDia: 45200,
      clientesNuevos: 3,
      stockCritico: 5,
    });
  }, [fetchTurnos]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Get today's date formatted
  const getTodayFormatted = () => {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  };

  // Stats configuration
  const statsConfig = [
    { 
      icon: Calendar, 
      label: 'Turnos Hoy', 
      value: stats.turnosHoy,
      color: 'var(--primary)',
      trend: 12,
    },
    { 
      icon: CreditCard, 
      label: 'Ventas del Día', 
      value: formatCurrency(stats.ventasDia),
      color: 'var(--success)',
      trend: 8,
    },
    { 
      icon: Users, 
      label: 'Clientes Nuevos', 
      value: stats.clientesNuevos,
      color: 'var(--accent)',
    },
    { 
      icon: Package, 
      label: 'Stock Crítico', 
      value: stats.stockCritico,
      color: 'var(--danger)',
    },
  ];

  // Popular services mock
  const popularServices = [
    { id: 1, nombre: 'Corte de cabello', count: 45 },
    { id: 2, nombre: 'Coloración', count: 32 },
    { id: 3, nombre: 'Manicure', count: 28 },
    { id: 4, nombre: 'Pedicure', count: 21 },
  ];

  return (
    <motion.div
      className={styles.dashboard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.greeting}>
            {getGreeting()}, <span className={styles.userName}>{user?.nombre}</span>
          </h1>
          <p className={styles.date}>{getTodayFormatted()}</p>
        </div>
        <Button 
          icon={Plus} 
          onClick={() => navigate('/turnos/nuevo')}
        >
          Nuevo Turno
        </Button>
      </header>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </section>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Próximos Turnos */}
        <Card className={styles.turnosCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <Clock size={20} />
              Próximos Turnos
            </h2>
            <Link to="/turnos" className={styles.viewAllLink}>
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className={styles.turnosList}>
            {loading ? (
              <div className={styles.loading}>Cargando...</div>
            ) : turnos.length > 0 ? (
              turnos.slice(0, 5).map(turno => (
                <TurnoItem 
                  key={turno.id} 
                  turno={turno}
                  onClick={() => navigate(`/turnos/${turno.id}`)}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <Calendar size={48} className={styles.emptyIcon} />
                <p>No hay turnos para hoy</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/turnos/nuevo')}
                >
                  Agendar turno
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Servicios Populares */}
        <Card className={styles.servicesCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              <TrendingUp size={20} />
              Servicios Populares
            </h2>
            <Link to="/servicios" className={styles.viewAllLink}>
              Ver todos
              <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className={styles.servicesList}>
            {popularServices.map((service, index) => (
              <div key={service.id} className={styles.serviceItem}>
                <div className={styles.serviceRank}>{index + 1}</div>
                <span className={styles.serviceName}>{service.nombre}</span>
                <span className={styles.serviceCount}>{service.count} turnos</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas de Stock */}
        {stats.stockCritico > 0 && (
          <Card className={styles.alertsCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <AlertTriangle size={20} style={{ color: 'var(--danger)' }} />
                Alertas de Stock
              </h2>
            </div>
            <div className={styles.alertContent}>
              <p>Hay <strong>{stats.stockCritico} productos</strong> con stock bajo</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/inventario')}
              >
                Ver inventario
              </Button>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
// ========================================
// Dashboard.module.css
// ========================================
/*
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.greeting {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  color: var(--primary);
}

.userName {
  color: var(--text);
}

.date {
  color: var(--text-muted);
  text-transform: capitalize;
}

.statsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .statsGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.statCard {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.statIcon {
  padding: var(--space-3);
  border-radius: var(--radius-xl);
}

.statValue {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.statLabel {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.statTrend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 600;
  margin-left: auto;
}

.contentGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 1024px) {
  .contentGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.cardTitle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: 600;
}

.viewAllLink {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--primary);
}

.turnosList {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.turnoItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.turnoItem:hover {
  background: var(--bg);
}

.turnoTime {
  padding: var(--space-2) var(--space-3);
  background: var(--primary);
  background: rgba(108, 99, 255, 0.1);
  border-radius: var(--radius-md);
}

.timeText {
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--primary);
}

.turnoInfo {
  flex: 1;
}

.turnoCliente {
  font-weight: 500;
}

.turnoServicios {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.servicesList {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.serviceItem {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.serviceRank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
}

.serviceName {
  flex: 1;
}

.serviceCount {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8);
  color: var(--text-muted);
}

.emptyIcon {
  opacity: 0.3;
}

.alertContent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
}
*/