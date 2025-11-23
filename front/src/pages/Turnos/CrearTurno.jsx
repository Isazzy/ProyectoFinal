// ========================================
// src/pages/Turnos/CrearTurno.jsx
// ========================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Check, Clock } from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { useServicios } from '../../hooks/useServicios';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearTurno.module.css';

// Service Selection Card
const ServiceCard = ({ servicio, selected, onToggle }) => (
  <motion.button
    className={`${styles.serviceCard} ${selected ? styles.selected : ''}`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onToggle}
  >
    <div className={styles.serviceInfo}>
      <p className={styles.serviceName}>{servicio.nombre}</p>
      <p className={styles.serviceDuration}>{servicio.duracion} min</p>
    </div>
    <p className={styles.servicePrice}>{formatCurrency(servicio.precio)}</p>
    {selected && (
      <div className={styles.checkMark}>
        <Check size={16} />
      </div>
    )}
  </motion.button>
);

// Time Slot Button
const TimeSlot = ({ time, available, selected, onClick }) => (
  <motion.button
    className={`${styles.timeSlot} ${selected ? styles.selected : ''} ${!available ? styles.disabled : ''}`}
    whileHover={available ? { scale: 1.05 } : {}}
    whileTap={available ? { scale: 0.95 } : {}}
    onClick={available ? onClick : undefined}
    disabled={!available}
  >
    {time}
  </motion.button>
);

export const CrearTurno = () => {
  const navigate = useNavigate();
  const { crearTurno, fetchHorariosDisponibles, horariosDisponibles, loading: turnosLoading } = useTurnos();
  const { servicios, fetchServicios, loading: serviciosLoading } = useServicios();
  const { showWarning } = useSwal();

  // Form state
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [cliente, setCliente] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load services on mount
  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  // Fetch available slots when date/services change
  useEffect(() => {
    if (selectedDate && selectedServices.length > 0) {
      fetchHorariosDisponibles(selectedDate, selectedServices);
    }
  }, [selectedDate, selectedServices, fetchHorariosDisponibles]);

  // Calculate totals
  const { totalPrice, totalDuration } = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const service = servicios.find(s => s.id === id);
      if (service) {
        acc.totalPrice += service.precio;
        acc.totalDuration += service.duracion;
      }
      return acc;
    }, { totalPrice: 0, totalDuration: 0 });
  }, [selectedServices, servicios]);

  // Toggle service selection
  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedSlot(''); // Reset slot when services change
  };

  // Validate form
  const validateForm = () => {
    if (selectedServices.length === 0) {
      showWarning('Selecciona servicios', 'Debes seleccionar al menos un servicio');
      return false;
    }
    if (!selectedDate) {
      showWarning('Selecciona fecha', 'Debes seleccionar una fecha');
      return false;
    }
    if (!selectedSlot) {
      showWarning('Selecciona horario', 'Debes seleccionar un horario disponible');
      return false;
    }
    if (!cliente.trim()) {
      showWarning('Ingresa cliente', 'Debes ingresar el nombre del cliente');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await crearTurno({
        fecha: selectedDate,
        hora: selectedSlot,
        servicios_ids: selectedServices,
        cliente_nombre: cliente,
        observaciones,
      });
      navigate('/turnos');
    } catch (error) {
      console.error('Error creating turno:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Min date (today)
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      className={styles.crearTurnoPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/turnos')}>
          <ChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>Crear Nuevo Turno</h1>
      </header>

      <div className={styles.content}>
        {/* Main Form */}
        <div className={styles.formSection}>
          {/* Services Selection */}
          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Seleccionar Servicios</h2>
            {serviciosLoading ? (
              <p>Cargando servicios...</p>
            ) : (
              <div className={styles.servicesGrid}>
                {servicios.filter(s => s.activo).map(servicio => (
                  <ServiceCard
                    key={servicio.id}
                    servicio={servicio}
                    selected={selectedServices.includes(servicio.id)}
                    onToggle={() => toggleService(servicio.id)}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Date & Time Selection */}
          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Fecha y Horario</h2>
            <Input
              label="Fecha"
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
              min={minDate}
              icon={Calendar}
            />
            
            {selectedDate && selectedServices.length > 0 && (
              <div className={styles.slotsSection}>
                <p className={styles.slotsLabel}>Horarios disponibles:</p>
                <div className={styles.slotsGrid}>
                  {(horariosDisponibles || []).map(slot => (
                    <TimeSlot
                      key={slot.hora || slot}
                      time={slot.hora || slot}
                      available={slot.disponible !== false}
                      selected={selectedSlot === (slot.hora || slot)}
                      onClick={() => setSelectedSlot(slot.hora || slot)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Client Info */}
          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Información del Cliente</h2>
            <Input
              label="Nombre del cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Buscar o escribir nombre"
              icon={User}
            />
            <div className={styles.textareaWrapper}>
              <label className={styles.textareaLabel}>Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className={styles.summarySection}>
          <Card className={styles.summaryCard}>
            <h2 className={styles.sectionTitle}>Resumen</h2>
            
            {selectedServices.length > 0 ? (
              <>
                <div className={styles.summaryItems}>
                  {selectedServices.map(id => {
                    const service = servicios.find(s => s.id === id);
                    return service ? (
                      <div key={id} className={styles.summaryItem}>
                        <span>{service.nombre}</span>
                        <span>{formatCurrency(service.precio)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryMeta}>
                  <div className={styles.summaryRow}>
                    <Clock size={16} />
                    <span>Duración total</span>
                    <span>{totalDuration} min</span>
                  </div>
                  {selectedSlot && (
                    <div className={styles.summaryRow}>
                      <Calendar size={16} />
                      <span>Horario</span>
                      <span className={styles.timeHighlight}>{selectedSlot}</span>
                    </div>
                  )}
                </div>

                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>{formatCurrency(totalPrice)}</span>
                </div>

                <Button
                  fullWidth
                  icon={Check}
                  loading={submitting}
                  onClick={handleSubmit}
                  className={styles.submitBtn}
                >
                  Reservar Turno
                </Button>
              </>
            ) : (
              <p className={styles.emptyMessage}>
                Selecciona servicios para ver el resumen
              </p>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
