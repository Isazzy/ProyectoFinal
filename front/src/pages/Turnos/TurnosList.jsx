import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, Plus, Eye, CheckCircle, ThumbsUp, DollarSign, 
  ChevronLeft, ChevronRight, RefreshCw, ReceiptText, List as ListIcon, Clock, User
} from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { Card, Button, Badge, Input } from '../../components/ui';
import styles from '../../styles/Turnos.module.css';

// --- COMPONENTE: ACCIONES (Reutilizable para Lista y Agenda) ---
const TurnoActions = ({ turno, onView, onConfirm, onComplete, onCreateSale, onViewSale }) => {
    const isPaid = !!turno.venta_id;
    
    return (
        <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => onView(turno)} title="Ver detalle">
                <Eye size={18}/>
            </button>

            {turno.estado === 'pendiente' && (
                <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={() => onConfirm(turno)} title="Confirmar">
                    <ThumbsUp size={18}/>
                </button>
            )}

            {turno.estado === 'confirmado' && (
                <button className={`${styles.actionBtn} ${styles.infoBtn}`} onClick={() => onComplete(turno)} title="Finalizar">
                    <CheckCircle size={18}/>
                </button>
            )}

            {turno.estado === 'completado' && (
                isPaid ? (
                    <button className={`${styles.actionBtn}`} onClick={() => onViewSale(turno.venta_id)} title="Ver Comprobante">
                        <ReceiptText size={18} />
                    </button>
                ) : (
                    <button className={`${styles.actionBtn} ${styles.successBtn}`} onClick={() => onCreateSale(turno)} title="Cobrar">
                        <DollarSign size={18} strokeWidth={2.5} />
                    </button>
                )
            )}
        </div>
    );
};

// --- VISTA 1: FILA DE TABLA ---
const TurnoRow = ({ turno, ...actions }) => {
  const statusColors = { pendiente: 'warning', confirmado: 'primary', completado: 'info', cancelado: 'danger' };
  const getHora = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';
  const isPaid = !!turno.venta_id;

  return (
    <motion.tr className={styles.turnoRow} whileHover={{ backgroundColor: 'var(--bg)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <td className={styles.timeCell}><span className={styles.timeText}>{getHora(turno.fecha_hora_inicio)}</span></td>
      <td className={styles.clienteCell}>
        <div className={styles.clienteInfo}>
          <div className={styles.clienteAvatar}>{(turno.cliente || 'C')[0].toUpperCase()}</div>
          <div className={styles.clienteData}>
             <span className={styles.clientName}>{turno.cliente || 'Cliente Eventual'}</span>
          </div>
        </div>
      </td>
      <td className={styles.serviciosCell}>
        <div className={styles.serviciosTags}>
          {(turno.servicios || []).slice(0, 2).map((s, i) => (
            <span key={i} className={styles.servicioTag}>{s.nombre}</span>
          ))}
          {(turno.servicios?.length || 0) > 2 && <span className={styles.servicioMore}>+{turno.servicios.length - 2}</span>}
        </div>
      </td>
      <td className={styles.estadoCell}>
          <Badge variant={statusColors[turno.estado] || 'default'}>{turno.estado}</Badge>
          {isPaid && <span className={styles.paidTag}>Pagado</span>}
      </td>
      <td className={styles.actionsCell}>
        <TurnoActions turno={turno} {...actions} />
      </td>
    </motion.tr>
  );
};

// --- VISTA 2: TARJETA DE AGENDA (Timeline) ---
const TurnoCard = ({ turno, ...actions }) => {
    const statusColors = { pendiente: 'warning', confirmado: 'primary', completado: 'info', cancelado: 'danger' };
    const getHora = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';
    const isPaid = !!turno.venta_id;

    return (
        <motion.div className={styles.agendaCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.agendaTime}>
                <Clock size={14} /> {getHora(turno.fecha_hora_inicio)}
            </div>
            <div className={styles.agendaContent}>
                <div className={styles.agendaHeader}>
                    <h4 className={styles.agendaClient}>{turno.cliente || 'Cliente Eventual'}</h4>
                    <div style={{display:'flex', gap:5, alignItems:'center'}}>
                        <Badge variant={statusColors[turno.estado] || 'default'} size="sm">{turno.estado}</Badge>
                        {isPaid && <span className={styles.paidDot} title="Pagado">●</span>}
                    </div>
                </div>
                <div className={styles.agendaServices}>
                    {(turno.servicios || []).map((s, i) => (
                        <span key={i}>{s.nombre}{i < turno.servicios.length - 1 ? ', ' : ''}</span>
                    ))}
                </div>
                <div className={styles.agendaFooter}>
                    <TurnoActions turno={turno} {...actions} />
                </div>
            </div>
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const TurnosList = () => {
  const navigate = useNavigate();
  const { turnos, loading, fetchTurnos, confirmarTurno, completarTurno } = useTurnos();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'agenda'

  useEffect(() => { 
      fetchTurnos({ fecha: selectedDate }); 
  }, [selectedDate, fetchTurnos]);

  const filteredTurnos = useMemo(() => {
    if (!Array.isArray(turnos)) return [];
    return turnos.filter(t => {
      const st = statusFilter === 'todos' || t.estado === statusFilter;
      const sr = !searchQuery || (t.cliente || '').toLowerCase().includes(searchQuery.toLowerCase());
      return st && sr;
    }).sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));
  }, [turnos, statusFilter, searchQuery]);

  const changeDate = (d) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + d);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // --- HANDLERS ---
  const actions = {
      onView: (t) => navigate(`/turnos/${t.id}`),
      onConfirm: async (t) => await confirmarTurno(t.id),
      onComplete: async (t) => await completarTurno(t.id),
      onCreateSale: (t) => navigate(`/ventas/nuevo?turno_id=${t.id}`),
      onViewSale: (id) => navigate(`/ventas/${id}`)
  };

  // --- RENDERIZADO DE VISTAS ---
  const renderContent = () => {
      if (loading) return <div className={styles.loading}><RefreshCw className="animate-spin"/> Cargando agenda...</div>;
      
      if (filteredTurnos.length === 0) {
          return (
            <div className={styles.emptyState}>
                <CalendarIcon size={48} color="#e2e8f0"/>
                <p>No hay turnos para esta fecha.</p>
                <Button variant="outline" onClick={() => navigate('/turnos/nuevo')}>Agendar Turno</Button>
            </div>
          );
      }

      if (viewMode === 'list') {
          return (
            <Card className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Servicios</th>
                        <th>Estado</th>
                        <th style={{textAlign:'right'}}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredTurnos.map(t => (
                        <TurnoRow key={t.id} turno={t} {...actions} />
                    ))}
                    </tbody>
                </table>
            </Card>
          );
      } else {
          return (
             <div className={styles.agendaGrid}>
                 {/* Renderizamos una línea de tiempo simple */}
                 {filteredTurnos.map(t => (
                     <div key={t.id} className={styles.agendaRowWrapper}>
                         <div className={styles.timeMarker}>
                            <span>{new Date(t.fecha_hora_inicio).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            <div className={styles.timeLine}></div>
                         </div>
                         <TurnoCard turno={t} {...actions} />
                     </div>
                 ))}
             </div>
          );
      }
  };

  return (
    <motion.div className={styles.turnosPage} initial={{opacity:0}} animate={{opacity:1}}>
      
      {/* HEADER & TOOLBAR */}
      <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Agenda</h1>
            <p className={styles.subtitle}>Gestión de citas</p>
          </div>
          <div className={styles.mainActions}>
             {/* Toggle de Vista */}
             <div className={styles.viewToggle}>
                 <button 
                    className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`} 
                    onClick={() => setViewMode('list')}
                    title="Vista Lista"
                 >
                     <ListIcon size={20}/>
                 </button>
                 <button 
                    className={`${styles.toggleBtn} ${viewMode === 'agenda' ? styles.active : ''}`} 
                    onClick={() => setViewMode('agenda')}
                    title="Vista Agenda"
                 >
                     <CalendarIcon size={20}/>
                 </button>
             </div>
             <Button icon={Plus} onClick={() => navigate('/turnos/nuevo')}>Nuevo Turno</Button>
          </div>
      </div>

      {/* CONTROLES DE NAVEGACIÓN Y FILTROS */}
      <div className={styles.controlsContainer}>
          
          {/* Navegación de Fecha */}
          <div className={styles.dateNav}>
            <button className={styles.navArrow} onClick={() => changeDate(-1)}><ChevronLeft size={20}/></button>
            <div className={styles.dateDisplay}>
                <CalendarIcon size={18} className={styles.dateIcon}/>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className={styles.dateInput}
                />
            </div>
            <button className={styles.navArrow} onClick={() => changeDate(1)}><ChevronRight size={20}/></button>
          </div>

          {/* Filtros */}
          <div className={styles.filtersGroup}>
              <div className={styles.statusFilters}>
                {['todos','pendiente','confirmado','completado'].map(s => (
                    <button 
                        key={s} 
                        className={`${styles.filterChip} ${statusFilter===s ? styles.active : ''}`} 
                        onClick={() => setStatusFilter(s)}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
              </div>
              <div className={styles.searchBox}>
                  <Input 
                    placeholder="Buscar cliente..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{margin:0}}
                  />
              </div>
          </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div 
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
          </AnimatePresence>
      </div>
    </motion.div>
  );
};