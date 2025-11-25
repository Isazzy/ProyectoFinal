// ========================================
// src/pages/Dashboard/Dashboard.jsx coordina la carga de datos
// ========================================
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, CreditCard, Users, Package, Plus, 
  TrendingUp, Clock, ChevronRight, AlertTriangle, 
  Droplet, Tag, BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency, formatTime } from '../../utils/formatters';
import styles from '../../styles/Dashboard.module.css';
import { IngresosChart } from '../../components/Charts/IngresosChart';

// APIs para data real
import { turnosApi } from '../../api/turnosApi';
import { ventasApi } from '../../api/ventasApi';
import { inventarioApi } from '../../api/inventarioApi';
import { clientesApi } from '../../api/clientesApi';




// --- COMPONENTES UI INTERNOS ---

const StatCard = ({ icon: Icon, label, value, subtext, color, type = 'default' }) => (
  <motion.div 
    className={`${styles.statCard} ${styles[type]}`}
    initial={{ y: 10, opacity: 0 }} 
    animate={{ y: 0, opacity: 1 }}
    whileHover={{ y: -5 }}
  >
    <div className={styles.statIconWrapper} style={{ backgroundColor: `${color}15`, color: color }}>
      <Icon size={24} />
    </div>
    <div className={styles.statInfo}>
      <h3 className={styles.statValue} style={{ color: type === 'alert' ? color : 'inherit' }}>{value}</h3>
      <p className={styles.statLabel}>{label}</p>
      {subtext && <span className={styles.statSubtext}>{subtext}</span>}
    </div>
  </motion.div>
);

const ServiceBarChart = ({ data }) => {
  if (!data || data.length === 0) return <p className={styles.emptyText}>Sin datos suficientes</p>;
  
  const maxVal = Math.max(...data.map(d => d.count));

  return (
    <div className={styles.chartContainer}>
      {data.map((item, idx) => (
        <div key={item.id} className={styles.chartRow}>
          <div className={styles.chartLabel}>
            <span>{item.nombre}</span>
            <span className={styles.chartValue}>{item.count}</span>
          </div>
          <div className={styles.chartBarBg}>
            <motion.div 
              className={styles.chartBarFill}
              initial={{ width: 0 }}
              animate={{ width: `${(item.count / maxVal) * 100}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const TurnoTimelineItem = ({ turno, onClick }) => {
  const statusColors = {
    pendiente: 'warning', confirmado: 'primary', completado: 'success', cancelado: 'danger'
  };

  return (
    <motion.div className={styles.timelineItem} onClick={onClick} whileHover={{ x: 5 }}>
      <div className={styles.timelineTime}>
        {formatTime(turno.fecha_hora_inicio)}
      </div>
      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <h4>{turno.cliente || 'Cliente Eventual'}</h4>
          <Badge variant={statusColors[turno.estado]} size="sm">{turno.estado}</Badge>
        </div>
        <p>{(turno.servicios || []).map(s => s.nombre).join(', ')}</p>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    ventasHoy: 0,
    clientesNuevos: 0,
    turnosHoy: [],
    alertasInsumos: 0,
    alertasProductos: 0,
    serviciosPopulares: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Cargar en paralelo para velocidad
        const [turnosRes, ventasRes, insumosRes, productosRes] = await Promise.all([
            turnosApi.getTurnos({ fecha: today }),
            ventasApi.getResumenVentas(), // { hoy: 12000, mes: 50000 }
            inventarioApi.getInsumos ? inventarioApi.getInsumos() : { results: [] },
            inventarioApi.getProductos ? inventarioApi.getProductos() : { results: [] }
        ]);

        // 2. Procesar Datos
        const turnosList = turnosRes.results || turnosRes;
        
        // Calcular alertas de stock (Insumos y Productos)
        const insumosBajos = (insumosRes.results || []).filter(i => parseFloat(i.insumo_stock) <= parseFloat(i.insumo_stock_minimo)).length;
        const productosBajos = (productosRes.results || []).filter(p => parseFloat(p.stock) <= parseFloat(p.stock_minimo)).length;

        // Calcular servicios populares (Mock logic basada en turnos de hoy, idealmente sería un endpoint de stats)
        // Simulamos datos para el gráfico si no hay suficientes turnos reales para hacerlo interesante
        const popularMock = [
            { id: 1, nombre: 'Corte Mujer', count: 42 },
            { id: 2, nombre: 'Coloración', count: 28 },
            { id: 3, nombre: 'Manicura Gel', count: 35 },
            { id: 4, nombre: 'Lifting Pestañas', count: 15 },
        ].sort((a,b) => b.count - a.count);

        setDashboardData({
            ventasHoy: ventasRes.hoy || 0,
            clientesNuevos: 5, // Dato simulado o requeriría clientesApi.getNuevos()
            turnosHoy: turnosList,
            alertasInsumos: insumosBajos,
            alertasProductos: productosBajos,
            serviciosPopulares: popularMock
        });

      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helpers de UI
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const todayDate = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>{getGreeting()}, <span className={styles.accent}>{user?.first_name || 'Administrador'}</span></h1>
          <p className={styles.date}><Calendar size={16}/> {todayDate}</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/turnos/nuevo')} className={styles.ctaButton}>
            Nuevo Turno
        </Button>
      </header>

      {/* KPI CARDS ROW */}
      <div className={styles.statsGrid}>
        
        {/* 1. Ventas del Día */}
        <StatCard 
            icon={CreditCard} 
            label="Ventas del Día" 
            value={formatCurrency(dashboardData.ventasHoy)} 
            color="#10b981"
            subtext="Caja Abierta"
        />

        {/* 2. Clientes Nuevos */}
        <StatCard 
            icon={Users} 
            label="Nuevos Clientes" 
            value={dashboardData.clientesNuevos} 
            color="#6366f1"
            subtext="Esta semana"
        />

        {/* 3. Alertas Stock Insumos */}
        <StatCard 
            icon={Droplet} 
            label="Stock Insumos" 
            value={dashboardData.alertasInsumos} 
            color={dashboardData.alertasInsumos > 0 ? "#ef4444" : "#64748b"}
            subtext="En nivel crítico"
            type={dashboardData.alertasInsumos > 0 ? "alert" : "default"}
        />

        {/* 4. Alertas Stock Productos */}
        <StatCard 
            icon={Tag} 
            label="Stock Productos" 
            value={dashboardData.alertasProductos} 
            color={dashboardData.alertasProductos > 0 ? "#f59e0b" : "#64748b"}
            subtext="Reponer pronto"
            type={dashboardData.alertasProductos > 0 ? "alert" : "default"}
        />
      </div>

      {/* MAIN GRID */}
      <div className={styles.contentGrid}>
        
        {/* COLUMNA 1: PRÓXIMOS TURNOS */}
        <Card className={styles.sectionCard}>
            <div className={styles.cardHeader}>
                <h3><Clock size={20}/> Turnos de Hoy</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/turnos')}>
                    Ver Agenda <ChevronRight size={16}/>
                </Button>
            </div>
            
            <div className={styles.timelineContainer}>
                {loading ? <p>Cargando agenda...</p> : (
                    dashboardData.turnosHoy.length > 0 ? (
                        dashboardData.turnosHoy.map(t => (
                            <TurnoTimelineItem key={t.id} turno={t} onClick={() => navigate(`/turnos/${t.id}`)} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Calendar size={40} />
                            <p>No hay más turnos hoy</p>
                        </div>
                    )
                )}
            </div>
        </Card>

        {/* COLUMNA 2: ANALÍTICAS */}
        <Card className={styles.sectionCard}>
             <div className={styles.cardHeader}>
                <h3><BarChart3 size={20}/> Servicios Populares</h3>
                <span className={styles.headerTag}>Este Mes</span>
            </div>
            <ServiceBarChart data={dashboardData.serviciosPopulares} />
              <div style={{marginTop: -20}}>
                  <IngresosChart />
              </div>
            {/* Resumen extra o accesos rápidos */}
            <div className={styles.quickActions}>
                 <h4>Accesos Rápidos</h4>
                 <div className={styles.actionButtons}>
                    <Button variant="outline" size="sm" onClick={() => navigate('/ventas/nuevo')}>Cobrar Venta</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/clientes')}>Base Clientes</Button>
                 </div>
            </div>
        </Card>

      </div>

    </motion.div>
  );
};
