// ========================================
// src/pages/Turnos/TurnosList.jsx
// ========================================
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Plus, Eye, Check, CreditCard, X, 
  ChevronLeft, ChevronRight, Filter, List, Grid
} from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { Card, Button, Badge, Input } from '../../components/ui';
import { formatDate, formatTime } from '../../utils/formatters';
import styles from '../../styles/Turnos.module.css';

// View Toggle Component
const ViewToggle = ({ view, setView }) => (
  <div className={styles.viewToggle}>
    <button
      className={`${styles.toggleBtn} ${view === 'list' ? styles.active : ''}`}
      onClick={() => setView('list')}
      aria-label="Vista lista"
    >
      <List size={18} />
    </button>
    <button
      className={`${styles.toggleBtn} ${view === 'calendar' ? styles.active : ''}`}
      onClick={() => setView('calendar')}
      aria-label="Vista calendario"
    >
      <Grid size={18} />
    </button>
  </div>
);

// Status Filter Component
const StatusFilter = ({ selected, onChange }) => {
  const statuses = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  return (
    <div className={styles.statusFilter}>
      {statuses.map(status => (
        <button
          key={status.value}
          className={`${styles.filterBtn} ${selected === status.value ? styles.active : ''}`}
          onClick={() => onChange(status.value)}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

// Turno Row Component
const TurnoRow = ({ turno, onView, onComplete, onCreateSale }) => {
  const statusColors = {
    pendiente: 'warning',
    confirmado: 'primary',
    completado: 'success',
    cancelado: 'danger',
  };

  return (
    <motion.tr
      className={styles.turnoRow}
      whileHover={{ backgroundColor: 'var(--bg)' }}
    >
      <td className={styles.timeCell}>
        <span className={styles.timeText}>{formatTime(turno.hora)}</span>
      </td>
      <td className={styles.clienteCell}>
        <div className={styles.clienteInfo}>
          <div className={styles.clienteAvatar}>
            {(turno.cliente_nombre || turno.cliente)?.[0] || 'C'}
          </div>
          <span>{turno.cliente_nombre || turno.cliente}</span>
        </div>
      </td>
      <td className={styles.serviciosCell}>
        <div className={styles.serviciosTags}>
          {(turno.servicios || []).slice(0, 2).map((s, i) => (
            <span key={i} className={styles.servicioTag}>
              {s.nombre || s}
            </span>
          ))}
          {(turno.servicios?.length || 0) > 2 && (
            <span className={styles.servicioMore}>
              +{turno.servicios.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className={styles.estadoCell}>
        <Badge variant={statusColors[turno.estado]}>
          {turno.estado}
        </Badge>
      </td>
      <td className={styles.actionsCell}>
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => onView(turno)}
            title="Ver detalle"
          >
            <Eye size={18} />
          </button>
          {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
            <button 
              className={`${styles.actionBtn} ${styles.successBtn}`}
              onClick={() => onComplete(turno)}
              title="Marcar completado"
            >
              <Check size={18} />
            </button>
          )}
          {turno.estado === 'completado' && (
            <button 
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
              onClick={() => onCreateSale(turno)}
              title="Crear venta"
            >
              <CreditCard size={18} />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

// Main TurnosList Component
export const TurnosList = () => {
  const navigate = useNavigate();
  const { turnos, loading, fetchTurnos, completarTurno } = useTurnos();
  
  const [view, setView] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch turnos on date change
  useEffect(() => {
    fetchTurnos({ fecha: selectedDate });
  }, [selectedDate, fetchTurnos]);

  // Filtered turnos
  const filteredTurnos = useMemo(() => {
    return turnos.filter(turno => {
      const matchesStatus = statusFilter === 'todos' || turno.estado === statusFilter;
      const matchesSearch = !searchQuery || 
        (turno.cliente_nombre || turno.cliente || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [turnos, statusFilter, searchQuery]);

  // Handlers
  const handleView = (turno) => navigate(`/turnos/${turno.id}`);
  const handleComplete = (turno) => completarTurno(turno.id, turno.cliente_nombre || turno.cliente);
  const handleCreateSale = (turno) => navigate(`/ventas/nuevo?turno_id=${turno.id}`);

  // Date navigation
  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <motion.div
      className={styles.turnosPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Agenda de Turnos</h1>
        <div className={styles.headerActions}>
          <ViewToggle view={view} setView={setView} />
          <Button icon={Plus} onClick={() => navigate('/turnos/nuevo')}>
            Nuevo Turno
          </Button>
        </div>
      </header>

      {/* Date Navigation */}
      <div className={styles.dateNav}>
        <button className={styles.dateNavBtn} onClick={() => changeDate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.dateInput}
        />
        <button className={styles.dateNavBtn} onClick={() => changeDate(1)}>
          <ChevronRight size={20} />
        </button>
        <button 
          className={styles.todayBtn}
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          Hoy
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
        <Input
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Turnos Table */}
      <Card className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Cargando turnos...</div>
        ) : filteredTurnos.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Hora</th>
                  <th className={styles.th}>Cliente</th>
                  <th className={styles.th}>Servicios</th>
                  <th className={styles.th}>Estado</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTurnos.map(turno => (
                  <TurnoRow
                    key={turno.id}
                    turno={turno}
                    onView={handleView}
                    onComplete={handleComplete}
                    onCreateSale={handleCreateSale}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Calendar size={48} className={styles.emptyIcon} />
            <p>No hay turnos para esta fecha</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/turnos/nuevo')}
            >
              Agendar turno
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};