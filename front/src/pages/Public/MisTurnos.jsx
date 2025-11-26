// ========================================
// src/pages/Public/MisTurnos.jsx
// ========================================
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertCircle, ChevronLeft, Scissors, XCircle } from 'lucide-react';
import { turnosApi } from '../../api/turnosApi';
import { useAuth } from '../../hooks/useAuth';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Badge } from '../../components/ui';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import styles from '../../styles/MisTurnos.module.css';

export const MisTurnos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, confirm } = useSwal();
  
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('proximos'); // 'proximos' | 'historial'

  // 1. Cargar Turnos del Cliente
  const fetchMisTurnos = async () => {
    setLoading(true);
    try {
      // El backend filtra automáticamente por request.user si es Cliente
      const data = await turnosApi.getTurnos(); 
      setTurnos(data.results || data);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudieron cargar tus turnos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisTurnos();
  }, []);

  // 2. Lógica de Cancelación
  const handleCancel = async (id) => {
      if (await confirm({ 
          title: '¿Cancelar Turno?', 
          text: 'Si cancelas, liberarás el horario para otra persona.', 
          isDanger: true,
          confirmText: 'Sí, cancelar'
      })) {
          try {
              await turnosApi.cancelarTurno(id);
              await showSuccess('Cancelado', 'Tu turno ha sido cancelado.');
              fetchMisTurnos(); // Recargar lista
          } catch (error) {
              showError('Error', 'No se pudo cancelar el turno.');
          }
      }
  };

  // 3. Filtrado de Turnos
  const now = new Date();
  const proximos = turnos.filter(t => new Date(t.fecha_hora_inicio) >= now && t.estado !== 'cancelado');
  const historial = turnos.filter(t => new Date(t.fecha_hora_inicio) < now || t.estado === 'cancelado');
  
  // Ordenar: Próximos (Más cercano primero), Historial (Más reciente primero)
  proximos.sort((a,b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));
  historial.sort((a,b) => new Date(b.fecha_hora_inicio) - new Date(a.fecha_hora_inicio));

  const displayList = activeTab === 'proximos' ? proximos : historial;

  // Helper de colores
  const getStatusVariant = (estado) => {
      switch(estado) {
          case 'pendiente': return 'warning';
          case 'confirmado': return 'primary';
          case 'completado': return 'success';
          case 'cancelado': return 'danger';
          default: return 'default';
      }
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      <div className={styles.header}>
         <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/')}>Volver al Inicio</Button>
         <h1 className={styles.title}>Mis Turnos</h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'proximos' ? styles.active : ''}`}
            onClick={() => setActiveTab('proximos')}
          >
              Próximos ({proximos.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'historial' ? styles.active : ''}`}
            onClick={() => setActiveTab('historial')}
          >
              Historial ({historial.length})
          </button>
      </div>

      {/* Lista */}
      <div className={styles.grid}>
          {loading ? (
              <p className={styles.loadingText}>Cargando agenda...</p>
          ) : displayList.length > 0 ? (
              displayList.map(t => (
                  <motion.div key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className={styles.turnoCard}>
                          <div className={styles.cardHeader}>
                              <div className={styles.dateBox}>
                                  <span className={styles.day}>{new Date(t.fecha_hora_inicio).getDate()}</span>
                                  <span className={styles.month}>{new Date(t.fecha_hora_inicio).toLocaleDateString('es-AR', {month:'short'})}</span>
                              </div>
                              <div className={styles.headerInfo}>
                                  <div className={styles.timeRow}>
                                      <Clock size={16}/> {formatTime(t.fecha_hora_inicio)}
                                  </div>
                                  <Badge variant={getStatusVariant(t.estado)} size="sm">{t.estado}</Badge>
                              </div>
                          </div>
                          
                          <div className={styles.servicesList}>
                              {(t.servicios || []).map((s, i) => (
                                  <div key={i} className={styles.serviceItem}>
                                      <Scissors size={14}/> 
                                      <span>{s.nombre}</span>
                                  </div>
                              ))}
                          </div>

                          {activeTab === 'proximos' && t.estado !== 'cancelado' && (
                              <div className={styles.actions}>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    icon={XCircle} 
                                    className={styles.cancelBtn}
                                    onClick={() => handleCancel(t.id)}
                                  >
                                      Cancelar Turno
                                  </Button>
                              </div>
                          )}
                      </Card>
                  </motion.div>
              ))
          ) : (
              <div className={styles.emptyState}>
                  <Calendar size={48} strokeWidth={1} />
                  <h3>No tienes turnos en esta sección</h3>
                  {activeTab === 'proximos' && (
                      <Button onClick={() => navigate('/reservar')}>Reservar Nuevo Turno</Button>
                  )}
              </div>
          )}
      </div>

    </motion.div>
  );
};