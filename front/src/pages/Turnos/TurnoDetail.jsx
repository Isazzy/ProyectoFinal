// ========================================
// src/pages/Turnos/TurnoDetail.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, X, CreditCard, Clock, User, FileText } from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { useTurnos } from '../../hooks/useTurnos';
import { Card, Button, Badge } from '../../components/ui';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import styles from '../../styles/TurnoDetail.module.css';

export const TurnoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completarTurno, cancelarTurno } = useTurnos();
  
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurno = async () => {
      try {
        const data = await turnosApi.getTurno(id);
        setTurno(data);
      } catch (error) {
        console.error('Error fetching turno:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!turno) return <div>Turno no encontrado</div>;

  const statusColors = {
    pendiente: 'warning',
    confirmado: 'primary',
    completado: 'success',
    cancelado: 'danger',
  };

  const handleComplete = async () => {
    const success = await completarTurno(turno.id, turno.cliente_nombre);
    if (success) setTurno(prev => ({ ...prev, estado: 'completado' }));
  };

  const handleCancel = async () => {
    const success = await cancelarTurno(turno.id);
    if (success) setTurno(prev => ({ ...prev, estado: 'cancelado' }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/turnos')}>
          <ChevronLeft size={24} />
        </button>
        <h1>Detalle del Turno</h1>
        <Badge variant={statusColors[turno.estado]}>{turno.estado}</Badge>
      </header>

      <div className={styles.grid}>
        <Card>
          <h2><Clock size={20} /> Información del Turno</h2>
          <div className={styles.infoGrid}>
            <div><label>Fecha</label><p>{formatDate(turno.fecha)}</p></div>
            <div><label>Hora</label><p className={styles.time}>{formatTime(turno.hora)}</p></div>
            <div><label>Duración</label><p>{turno.duracion_total || 60} minutos</p></div>
          </div>
        </Card>

        <Card>
          <h2><User size={20} /> Cliente</h2>
          <p className={styles.clientName}>{turno.cliente_nombre || turno.cliente}</p>
          {turno.cliente_telefono && <p>{turno.cliente_telefono}</p>}
        </Card>

        <Card>
          <h2>Servicios</h2>
          <div className={styles.servicesList}>
            {(turno.servicios || []).map((s, i) => (
              <div key={i} className={styles.serviceItem}>
                <span>{s.nombre || s}</span>
                <span>{formatCurrency(s.precio || 0)}</span>
              </div>
            ))}
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <span>{formatCurrency(turno.total || 0)}</span>
          </div>
        </Card>

        {turno.observaciones && (
          <Card>
            <h2><FileText size={20} /> Observaciones</h2>
            <p>{turno.observaciones}</p>
          </Card>
        )}
      </div>

      <div className={styles.actions}>
        {turno.estado !== 'completado' && turno.estado !== 'cancelado' && (
          <>
            <Button icon={Check} variant="success" onClick={handleComplete}>
              Marcar Completado
            </Button>
            <Button icon={X} variant="danger" onClick={handleCancel}>
              Cancelar Turno
            </Button>
          </>
        )}
        {turno.estado === 'completado' && (
          <Button 
            icon={CreditCard} 
            onClick={() => navigate(`/ventas/nuevo?turno_id=${turno.id}`)}
          >
            Crear Venta
          </Button>
        )}
      </div>
    </motion.div>
  );
};
