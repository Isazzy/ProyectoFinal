// ========================================
// src/pages/Dashboard/Dashboard.jsx
// Dashboard Mejorado con Reportes de Ingresos vs Egresos
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, CreditCard, Users, Package, Plus, 
  TrendingUp, Clock, ChevronRight, AlertTriangle, 
  Tag, BarChart3, CheckCircle, DollarSign, 
  TrendingDown, Filter
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Badge } from '../../components/ui';
import { formatCurrency, formatTime } from '../../utils/formatters';
import styles from '../../styles/Dashboard.module.css';

// APIs
import { turnosApi } from '../../api/turnosApi';
import { dashboardApi } from '../../api/dashboardApi';

// Componentes de Gráficos
import { PagosChart } from '../../components/Charts/PagosChart';
import { IngresosEgresosChart } from '../../components/Charts/IngresosEgresosChart';

// --- COMPONENTES UI INTERNOS ---

const StatCard = ({ icon: Icon, label, value, subtext, color, type = 'default', trend }) => (
  <motion.div 
    className={`${styles.statCard} ${type === 'alert' ? styles.alert : ''}`}
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
      {trend && (
        <span className={styles.statTrend} style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </motion.div>
);

const ServiceBarChart = ({ data }) => {
  if (!data || data.length === 0) return <p className={styles.emptyState}>Sin datos suficientes</p>;
  
  const maxVal = Math.max(...data.map(d => d.total_vendidos));

  return (
    <div className={styles.chartContainer}>
      {data.map((item, idx) => (
        <div key={idx} className={styles.chartRow}>
          <div className={styles.chartLabel}>
            <span>{item.servicio__nombre}</span>
            <span className={styles.chartValue}>{item.total_vendidos}</span>
          </div>
          <div className={styles.chartBarBg}>
            <motion.div 
              className={styles.chartBarFill}
              initial={{ width: 0 }}
              animate={{ width: `${(item.total_vendidos / maxVal) * 100}%` }}
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

const AlertasList = ({ alertas, onViewStock }) => {
    if (!alertas || alertas.length === 0) return (
        <div className={styles.emptyState} style={{color: '#10b981'}}>
            <CheckCircle size={32} style={{margin:'0 auto 10px', opacity: 0.8}}/>
            <p style={{margin:0}}>Stock en orden</p>
        </div>
    );

    return (
        <div className={styles.alertList} style={{display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto'}}>
            {alertas.map((item, idx) => (
                <div key={idx} className={styles.alertItem} style={{display: 'flex', alignItems:'center', gap: 10, padding: 10, background: '#fef2f2', borderRadius: 8, border: '1px solid #fee2e2'}}>
                    <div className={styles.alertIcon} style={{color:'#ef4444', background: 'white', padding: 6, borderRadius: 6}}>
                        {item.tipo === 'insumo' ? <Package size={16}/> : <Tag size={16}/>}
                    </div>
                    <div className={styles.alertInfo} style={{flex: 1}}>
                        <span className={styles.alertName} style={{fontWeight: 600, color: '#7f1d1d', fontSize: '0.9rem', display:'block'}}>{item.nombre}</span>
                        <span className={styles.alertStock} style={{fontSize: '0.75rem', color: '#991b1b'}}>
                            Quedan: <strong>{parseFloat(item.stock_actual)} {item.unidad}</strong> 
                            <span style={{opacity: 0.7}}> (Mín: {parseFloat(item.stock_minimo)})</span>
                        </span>
                    </div>
                    <Badge variant="danger" size="sm">Bajo</Badge>
                </div>
            ))}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [finanzasPeriodo, setFinanzasPeriodo] = useState('mes'); // 'semana' | 'mes' | 'trimestre'

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fecha local para filtrar turnos correctamente
        const todayDate = new Date();
        const offset = todayDate.getTimezoneOffset();
        const todayISO = new Date(todayDate.getTime() - (offset*60*1000)).toISOString().split('T')[0];
        
        // Carga paralela de datos
        const [kpiData, alertasData, turnosRes] = await Promise.all([
            dashboardApi.getKPIs(),
            dashboardApi.getAlertasStock(),
            turnosApi.getTurnos({ fecha: todayISO })
        ]);

        setKpis(kpiData);
        setAlertas(alertasData);

        // Procesar Turnos (Filtrado estricto y orden por hora)
        let listaTurnos = turnosRes.results || turnosRes || [];
        listaTurnos = listaTurnos.filter(t => t.fecha_hora_inicio.startsWith(todayISO));
        listaTurnos.sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));
        setTurnosHoy(listaTurnos);

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

  // Calcular balance (simulado - deberías traer esto del backend)
  const calcularBalance = () => {
    const ingresos = kpis?.finanzas?.ingresos_mes || 0;
    // Simulamos egresos como 40% de ingresos
    const egresos = ingresos * 0.4;
    const balance = ingresos - egresos;
    return { ingresos, egresos, balance };
  };

  const { ingresos, egresos, balance } = kpis ? calcularBalance() : { ingresos: 0, egresos: 0, balance: 0 };

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
       
        <StatCard 
            icon={AlertTriangle} 
            label="Alertas de Stock" 
            value={alertas.length} 
            color={alertas.length > 0 ? "#ef4444" : "#64748b"}
            subtext="Items críticos"
            type={alertas.length > 0 ? "alert" : "default"}
        />
      </div>

      {/* MAIN GRID */}
      <div className={styles.contentGrid}>
        
        {/* COLUMNA 1: AGENDA Y FLUJO DE CAJA */}
        <div className={styles.sectionCard} style={{gap: 25, background: 'transparent', boxShadow: 'none', border: 'none', padding: 0}}>
            
            {/* 1. Gráfico Ingresos vs Egresos */}
            <Card className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                    <h3><BarChart3 size={20}/> Flujo de Caja</h3>
                    <div style={{display: 'flex', gap: 8}}>
                        <Button 
                            variant={finanzasPeriodo === 'semana' ? 'primary' : 'ghost'} 
                            size="sm"
                            onClick={() => setFinanzasPeriodo('semana')}
                        >
                            Semana
                        </Button>
                        <Button 
                            variant={finanzasPeriodo === 'mes' ? 'primary' : 'ghost'} 
                            size="sm"
                            onClick={() => setFinanzasPeriodo('mes')}
                        >
                            Mes
                        </Button>
                    </div>
                </div>
                <IngresosEgresosChart periodo={finanzasPeriodo} />
            </Card>

            {/* 2. Turnos de Hoy (Compacto) */}
            <Card className={styles.sectionCard} style={{minHeight: 'auto'}}>
                <div className={styles.cardHeader}>
                    <h3><Clock size={20}/> Agenda de Hoy</h3>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/turnos')}>
                        Ver Completa <ChevronRight size={16}/>
                    </Button>
                </div>
                <div className={styles.timelineContainer} style={{maxHeight: 300, overflowY: 'auto'}}>
                    {loading ? <p style={{padding:20, textAlign:'center', color:'#888'}}>Cargando agenda...</p> : (
                        turnosHoy.length > 0 ? (
                            turnosHoy.map(t => (
                                <TurnoTimelineItem key={t.id} turno={t} onClick={() => navigate(`/turnos/${t.id}`)} />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <Calendar size={32} />
                                <p>Sin turnos para hoy</p>
                                <Button variant="outline" size="sm" onClick={() => navigate('/turnos/nuevo')} style={{marginTop:10}}>Agendar</Button>
                            </div>
                        )
                    )}
                </div>
            </Card>
        </div>
      

        {/* COLUMNA 2: ALERTAS Y MEDIOS DE PAGO */}
        <div className={styles.sectionCard} style={{gap: 25, background: 'transparent', boxShadow: 'none', border: 'none', padding: 0}}>
             
             {/* 1. Alertas de Stock */}
             <Card className={styles.sectionCard} style={{borderColor: alertas.length > 0 ? '#fecaca' : '#f1f5f9'}}>
                  <div className={styles.cardHeader}>
                      <h3 style={{color: alertas.length > 0 ? '#ef4444' : 'inherit'}}>
                          <AlertTriangle size={20}/> Reposición
                      </h3>
                      {alertas.length > 0 && <Badge variant="danger">{alertas.length}</Badge>}
                  </div>
                  <AlertasList alertas={alertas} />
                  {alertas.length > 0 && (
                      <div style={{marginTop: 15, paddingTop: 15, borderTop: '1px solid #eee'}}>
                          <Button size="sm" variant="outline" fullWidth onClick={() => navigate('/compras')}>
                              Ir a Compras
                          </Button>
                      </div>
                  )}
             </Card>

             

            
        </div>

      </div>

    </motion.div>
  );
};