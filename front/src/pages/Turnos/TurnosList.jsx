import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, Eye, CheckCircle, ThumbsUp, DollarSign, 
  ChevronLeft, ChevronRight, RefreshCw, ReceiptText 
} from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { Card, Button, Badge, Input } from '../../components/ui';
import styles from '../../styles/Turnos.module.css';

const TurnoRow = ({ turno, onView, onConfirm, onComplete, onCreateSale, onViewSale }) => {
  const statusColors = {
    pendiente: 'warning',
    confirmado: 'primary',
    completado: 'info',
    cancelado: 'danger',
  };
  
  const getHora = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--';

  // Detectamos si el turno ya fue cobrado
  const isPaid = !!turno.venta_id; 

  return (
    <motion.tr className={styles.turnoRow} whileHover={{ backgroundColor: 'var(--bg)' }}>
      <td className={styles.timeCell}><span className={styles.timeText}>{getHora(turno.fecha_hora_inicio)}</span></td>
      <td className={styles.clienteCell}>
        <div className={styles.clienteInfo}>
          <div className={styles.clienteAvatar}>{(turno.cliente || 'C')[0]}</div>
          <span>{turno.cliente || 'Cliente Eventual'}</span>
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
          {isPaid && <Badge variant="success" style={{marginLeft: 5, fontSize: '0.7rem'}}>Pagado</Badge>}
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onView(turno)} title="Ver detalle">
            <Eye size={18}/>
          </button>
          
          {/* --- FLUJO DE ACCIONES SEGÚN ESTADO --- */}
          
          {/* 1. PENDIENTE -> CONFIRMAR */}
          {turno.estado === 'pendiente' && (
            <button 
                className={`${styles.actionBtn} ${styles.primaryBtn}`} 
                onClick={() => onConfirm(turno)} 
                title="Confirmar asistencia"
            >
              <ThumbsUp size={18}/>
            </button>
          )}

          {/* 2. CONFIRMADO -> COMPLETAR (Realizar servicio) */}
          {turno.estado === 'confirmado' && (
            <button 
                className={`${styles.actionBtn} ${styles.infoBtn}`} 
                onClick={() => onComplete(turno)} 
                title="Marcar servicio como realizado"
                style={{ color: '#0284c7', background: '#e0f2fe' }}
            >
              <CheckCircle size={18}/>
            </button>
          )}

          {/* 3. COMPLETADO -> COBRAR o VER COMPROBANTE */}
          {turno.estado === 'completado' && (
            isPaid ? (
                // YA COBRADO: Mostrar botón para ver el recibo/detalle de venta
                <button 
                    className={`${styles.actionBtn}`} 
                    onClick={() => onViewSale(turno.venta_id)} 
                    title="Ver Comprobante de Venta"
                    style={{ color: '#64748b', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                >
                  <ReceiptText size={18} />
                </button>
            ) : (
                // PENDIENTE DE COBRO: Mostrar botón de cobrar
                <button 
                    className={`${styles.actionBtn}`} 
                    onClick={() => onCreateSale(turno)} 
                    title="Cobrar / Crear Venta"
                    style={{ color: '#16a34a', background: '#dcfce7', border: '1px solid #16a34a' }}
                >
                  <DollarSign size={18} strokeWidth={2.5} />
                </button>
            )
          )}
        </div>
      </td>
    </motion.tr>
  );
};

export const TurnosList = () => {
  const navigate = useNavigate();
  const { turnos, loading, fetchTurnos, confirmarTurno, completarTurno } = useTurnos();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { 
      fetchTurnos({ fecha: selectedDate }); 
  }, [selectedDate, fetchTurnos]);

  const filteredTurnos = useMemo(() => {
    if (!Array.isArray(turnos)) return [];
    return turnos.filter(t => {
      const st = statusFilter === 'todos' || t.estado === statusFilter;
      const sr = !searchQuery || (t.cliente || '').toLowerCase().includes(searchQuery.toLowerCase());
      return st && sr;
    });
  }, [turnos, statusFilter, searchQuery]);

  const changeDate = (d) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + d);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  // --- HANDLERS ---
  const handleView = (t) => navigate(`/turnos/${t.id}`);
  
  const handleConfirm = async (t) => {
      await confirmarTurno(t.id);
  };

  const handleComplete = async (t) => {
      await completarTurno(t.id);
  };

  const handleCreateSale = (t) => {
      // Ir a crear venta
      navigate(`/ventas/nuevo?turno_id=${t.id}`);
  };

  const handleViewSale = (ventaId) => {
      // Ir a ver detalle de venta existente
      navigate(`/ventas/${ventaId}`);
  };

  return (
    <motion.div className={styles.turnosPage} initial={{opacity:0}} animate={{opacity:1}}>
      <header className={styles.header}>
        <h1 className={styles.title}>Agenda</h1>
        <Button icon={Plus} onClick={() => navigate('/turnos/nuevo')}>Nuevo Turno</Button>
      </header>

      <div className={styles.dateNav}>
        <button onClick={() => changeDate(-1)}><ChevronLeft/></button>
        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}/>
        <button onClick={() => changeDate(1)}><ChevronRight/></button>
      </div>

      <div className={styles.filters}>
        {['todos','pendiente','confirmado','completado'].map(s => (
            <button key={s} className={statusFilter===s ? styles.active : ''} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
        ))}
        <Input placeholder="Buscar cliente..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
      </div>

      <Card>
        {loading ? (
            <div className={styles.loading}>
                <RefreshCw className="animate-spin"/> Cargando agenda...
            </div>
        ) : filteredTurnos.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr><th>Hora</th><th>Cliente</th><th>Servicios</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredTurnos.map(t => (
                <TurnoRow 
                  key={t.id} 
                  turno={t} 
                  onView={handleView} 
                  onConfirm={handleConfirm} 
                  onComplete={handleComplete} 
                  onCreateSale={handleCreateSale}
                  onViewSale={handleViewSale} // Nueva prop para ver el recibo
                />
              ))}
            </tbody>
          </table>
        ) : (
            <div className={styles.emptyState}>
                <Calendar size={48} color="#ccc"/>
                <p>No hay turnos para esta fecha.</p>
            </div>
        )}
      </Card>
    </motion.div>
  );
};