// ========================================
// src/pages/Turnos/TurnoDetail.jsx
// ========================================
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, CheckCircle, X, CreditCard, Clock, User, 
    FileText, ThumbsUp, Calendar, DollarSign, ReceiptText, Phone
} from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { useTurnos } from '../../hooks/useTurnos';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Badge } from '../../components/ui';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import styles from '../../styles/TurnoDetail.module.css';

export const TurnoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirmarTurno, completarTurno, cancelarTurno } = useTurnos();
  const { confirm, showSuccess } = useSwal();
  
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

  // Calculamos el total estimado sumando los precios de los servicios
  const totalEstimado = useMemo(() => {
      if (!turno?.servicios) return 0;
      return turno.servicios.reduce((acc, s) => acc + parseFloat(s.precio), 0);
  }, [turno]);

  if (loading) return <div className={styles.loading}>Cargando detalle...</div>;
  if (!turno) return <div className={styles.error}>Turno no encontrado</div>;

  // Mapa de colores
  const statusColors = {
    pendiente: 'warning',
    confirmado: 'primary',
    completado: 'info',
    cancelado: 'danger',
  };

  const isPaid = !!turno.venta_id;

  // --- HANDLERS ---

  const handleConfirm = async () => {
    if (await confirm({ title: 'Confirmar Asistencia', text: '¿El cliente ha confirmado que vendrá?' })) {
        const success = await confirmarTurno(turno.id);
        if (success) setTurno(prev => ({ ...prev, estado: 'confirmado' }));
    }
  };

  const handleComplete = async () => {
    if (await confirm({ title: 'Finalizar Servicio', text: '¿Marcar el trabajo como terminado?' })) {
        const success = await completarTurno(turno.id, turno.cliente);
        if (success) setTurno(prev => ({ ...prev, estado: 'completado' }));
    }
  };

  const handleCancel = async () => {
    if (await confirm({ title: 'Cancelar Turno', text: 'Esta acción liberará el horario.', isDanger: true })) {
        const success = await cancelarTurno(turno.id);
        if (success) setTurno(prev => ({ ...prev, estado: 'cancelado' }));
    }
  };

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/turnos')}>
            Volver a Agenda
        </Button>
        <div className={styles.headerTitle}>
            <h1>Turno #{turno.id}</h1>
            <Badge variant={statusColors[turno.estado] || 'default'} size="lg">
                {turno.estado.toUpperCase()}
            </Badge>
        </div>
      </header>

      <div className={styles.contentGrid}>
        
        {/* --- COLUMNA IZQUIERDA (Detalles) --- */}
        <div className={styles.leftColumn}>
            
            {/* TARJETA CLIENTE */}
            <Card className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}><User size={20} /> Cliente</h2>
                </div>
                <div className={styles.clientInfo}>
                    <div className={styles.clientAvatar}>
                        {(turno.cliente || 'C')[0].toUpperCase()}
                    </div>
                    <div className={styles.clientData}>
                        <h3 className={styles.clientName}>{turno.cliente || 'Cliente Eventual'}</h3>
                        {turno.cliente_telefono ? (
                            <span className={styles.clientPhone}><Phone size={14}/> {turno.cliente_telefono}</span>
                        ) : (
                            <span className={styles.noPhone}>Sin teléfono registrado</span>
                        )}
                    </div>
                </div>
            </Card>

            {/* TARJETA SERVICIOS */}
            <Card className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}><FileText size={20} /> Servicios Solicitados</h2>
                </div>
                <div className={styles.servicesList}>
                    {(turno.servicios || []).map((s, i) => (
                        <div key={i} className={styles.serviceItem}>
                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{s.nombre}</span>
                                <span className={styles.serviceDuration}><Clock size={12}/> {s.duracion_servicio} min</span>
                            </div>
                            <span className={styles.servicePrice}>{formatCurrency(s.precio)}</span>
                        </div>
                    ))}
                    <div className={styles.divider}></div>
                    <div className={styles.totalRow}>
                        <span>Total Estimado</span>
                        <span className={styles.totalPrice}>{formatCurrency(totalEstimado)}</span>
                    </div>
                </div>
            </Card>

            {/* OBSERVACIONES */}
            {turno.observaciones && (
                <Card className={styles.sectionCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Observaciones</h2>
                    </div>
                    <p className={styles.observacionesText}>{turno.observaciones}</p>
                </Card>
            )}
        </div>

        {/* --- COLUMNA DERECHA (Contexto y Acciones) --- */}
        <div className={styles.rightColumn}>
            
            {/* INFO FECHA/HORA */}
            <Card className={styles.contextCard}>
                <div className={styles.contextRow}>
                    <Calendar className={styles.contextIcon} size={20} />
                    <div>
                        <span className={styles.contextLabel}>Fecha</span>
                        <strong className={styles.contextValue}>{formatDate(turno.fecha_hora_inicio)}</strong>
                    </div>
                </div>
                <div className={styles.contextRow}>
                    <Clock className={styles.contextIcon} size={20} />
                    <div>
                        <span className={styles.contextLabel}>Horario</span>
                        <strong className={styles.contextValue}>
                            {formatTime(turno.fecha_hora_inicio)} 
                            <span className={styles.endTime}> - {formatTime(turno.fecha_hora_fin)}</span>
                        </strong>
                    </div>
                </div>
                <div className={styles.contextRow}>
                    <CheckCircle className={styles.contextIcon} size={20} />
                    <div>
                        <span className={styles.contextLabel}>Estado Pago</span>
                        {isPaid ? (
                            <Badge variant="success">PAGADO</Badge>
                        ) : (
                            <Badge variant="secondary">PENDIENTE</Badge>
                        )}
                    </div>
                </div>
            </Card>

            {/* ACCIONES */}
            <Card className={styles.actionsCard}>
                <h3 className={styles.actionsTitle}>Acciones</h3>
                <div className={styles.actionsGrid}>
                    
                    {/* Flujo PENDIENTE */}
                    {turno.estado === 'pendiente' && (
                        <>
                            <Button icon={ThumbsUp} fullWidth onClick={handleConfirm}>Confirmar</Button>
                            <Button variant="danger" icon={X} fullWidth onClick={handleCancel}>Cancelar</Button>
                        </>
                    )}

                    {/* Flujo CONFIRMADO */}
                    {turno.estado === 'confirmado' && (
                        <>
                            <Button icon={CheckCircle} variant="success" fullWidth onClick={handleComplete}>Finalizar Trabajo</Button>
                            <Button variant="outline" icon={X} fullWidth onClick={handleCancel} style={{borderColor:'#fee2e2', color:'#ef4444'}}>Cancelar</Button>
                        </>
                    )}

                    {/* Flujo COMPLETADO */}
                    {turno.estado === 'completado' && (
                        isPaid ? (
                            <Button 
                                icon={ReceiptText} 
                                variant="secondary" 
                                fullWidth 
                                onClick={() => navigate(`/ventas/${turno.venta_id}`)}
                            >
                                Ver Comprobante
                            </Button>
                        ) : (
                            <Button 
                                icon={DollarSign} 
                                fullWidth 
                                onClick={() => navigate(`/ventas/nuevo?turno_id=${turno.id}`)}
                                className={styles.payButton}
                            >
                                Cobrar Turno
                            </Button>
                        )
                    )}

                    {/* Flujo CANCELADO */}
                    {turno.estado === 'cancelado' && (
                        <p className={styles.cancelledText}>Este turno fue cancelado.</p>
                    )}
                </div>
            </Card>
        </div>

      </div>
    </motion.div>
  );
};