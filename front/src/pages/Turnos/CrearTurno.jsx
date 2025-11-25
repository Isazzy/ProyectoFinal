// ========================================
// src/pages/Turnos/CrearTurno.jsx
// ========================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Check, Clock, Search, X } from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { useServicios } from '../../hooks/useServicios';
import { clientesApi } from '../../api/clientesApi';
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input, Badge } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearTurno.module.css';

// --- Sub-componentes ---

const ServiceCard = ({ servicio, selected, onToggle }) => (
  <motion.div
    className={`${styles.serviceCard} ${selected ? styles.selected : ''}`}
    onClick={onToggle}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={styles.serviceHeader}>
        <span className={styles.serviceName}>{servicio.nombre}</span>
        {selected && <div className={styles.checkMark}><Check size={14} /></div>}
    </div>
    <div className={styles.serviceFooter}>
        <span className={styles.serviceDuration}><Clock size={12}/> {servicio.duracion} min</span>
        <span className={styles.servicePrice}>{formatCurrency(servicio.precio)}</span>
    </div>
  </motion.div>
);

const TimeSlot = ({ time, available, selected, onClick }) => (
  <button
    className={`${styles.timeSlot} ${selected ? styles.selected : ''} ${!available ? styles.disabled : ''}`}
    onClick={available ? onClick : undefined}
    disabled={!available}
    type="button"
  >
    {time}
  </button>
);

// --- Componente Principal ---

export const CrearTurno = () => {
  const navigate = useNavigate();
  const { crearTurno, fetchHorariosDisponibles, horariosDisponibles } = useTurnos();
  const { servicios, fetchServicios, loading: serviciosLoading } = useServicios();
  const { showWarning, showSuccess } = useSwal();

  // Estados del Formulario
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados de Búsqueda de Cliente
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesFound, setClientesFound] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null); 
  const [searchingClient, setSearchingClient] = useState(false);

  // 1. Cargar Servicios
  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  // 2. Consultar Disponibilidad
  useEffect(() => {
    if (selectedDate && selectedServices.length > 0) {
      // CORRECCIÓN: Pasamos el array directamente. La API (turnosApi.js) se encarga de hacer el .join si es necesario.
      fetchHorariosDisponibles(selectedDate, selectedServices);
      
      setSelectedSlot(''); // Resetear hora si cambian parámetros
    }
  }, [selectedDate, selectedServices, fetchHorariosDisponibles]);

  // 3. Buscador de Clientes (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (clienteSearch.length > 2 && !selectedCliente) {
        setSearchingClient(true);
        try {
          const res = await clientesApi.getClientes({ search: clienteSearch });
          setClientesFound(res.results || res);
        } catch (error) {
          console.error("Error buscando clientes", error);
        } finally {
            setSearchingClient(false);
        }
      } else {
        setClientesFound([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [clienteSearch, selectedCliente]);

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
    setClienteSearch(`${cliente.nombre} ${cliente.apellido}`);
    setClientesFound([]);
  };

  const handleClearCliente = () => {
      setSelectedCliente(null);
      setClienteSearch('');
  };

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedSlot('');
  };

  const { totalPrice, totalDuration } = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const service = servicios.find(s => s.id_serv === id || s.id === id); 
      if (service) {
        acc.totalPrice += parseFloat(service.precio);
        acc.totalDuration += service.duracion;
      }
      return acc;
    }, { totalPrice: 0, totalDuration: 0 });
  }, [selectedServices, servicios]);


  const handleSubmit = async () => {
    if (!selectedCliente) return showWarning('Falta Cliente', 'Por favor seleccione un cliente.');
    if (selectedServices.length === 0) return showWarning('Faltan Servicios', 'Seleccione al menos un servicio.');
    if (!selectedDate) return showWarning('Falta Fecha', 'Seleccione una fecha para el turno.');
    if (!selectedSlot) return showWarning('Falta Hora', 'Seleccione un horario disponible.');

    setSubmitting(true);
    try {
      const fechaHoraInicio = `${selectedDate}T${selectedSlot}:00`;
      
      // Validamos que el cliente tenga usuario asociado (user_id)
      const idUsuario = selectedCliente.user_id;
      if (!idUsuario) {
          throw new Error("El cliente seleccionado no tiene un usuario válido asociado.");
      }

      const payload = {
        cliente: idUsuario, 
        fecha_hora_inicio: fechaHoraInicio,
        servicios: selectedServices,
        observaciones: observaciones
      };

      await crearTurno(payload);
      await showSuccess('¡Turno Creado!', `Agendado para el ${new Date(fechaHoraInicio).toLocaleDateString()}`);
      navigate('/turnos');

    } catch (error) {
      console.error(error);
      // El hook useTurnos generalmente muestra el error, pero si no, descomenta:
      // showWarning('Error', 'No se pudo crear el turno');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div className={styles.pageContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      
      <header className={styles.header}>
        <Button variant="ghost" icon={ChevronLeft} onClick={() => navigate('/turnos')}>
            Volver
        </Button>
        <h1 className={styles.title}>Nuevo Turno</h1>
      </header>

      <div className={styles.contentGrid}>
        
        <div className={styles.leftColumn}>
          
          {/* 1. BUSCADOR DE CLIENTE */}
          {/* IMPORTANTE: 'overflowVisible' permite que el dropdown salga de la tarjeta */}
          <Card className={`${styles.sectionCard} ${styles.overflowVisible}`}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><User size={20}/> Cliente</h2>
            </div>
            <div className={styles.searchWrapper}>
                <Input
                    placeholder="Buscar por nombre, apellido o email..."
                    value={clienteSearch}
                    onChange={(e) => setClienteSearch(e.target.value)}
                    icon={Search}
                    disabled={!!selectedCliente} 
                />
                {selectedCliente && (
                    <button className={styles.clearBtn} onClick={handleClearCliente}>
                        <X size={18} />
                    </button>
                )}
                
                {!selectedCliente && clientesFound.length > 0 && (
                    <ul className={styles.resultsDropdown}>
                        {clientesFound.map(c => (
                            <li key={c.id} onClick={() => handleSelectCliente(c)} className={styles.resultItem}>
                                <div className={styles.clientName}>{c.nombre} {c.apellido}</div>
                                <div className={styles.clientEmail}>{c.email}</div>
                            </li>
                        ))}
                    </ul>
                )}
                {!selectedCliente && clienteSearch.length > 2 && clientesFound.length === 0 && !searchingClient && (
                     <div className={styles.noResults}>No se encontraron clientes.</div>
                )}
            </div>
            {selectedCliente && (
                <div className={styles.selectedInfo}>
                    <span className={styles.label}>Teléfono:</span> {selectedCliente.telefono || '-'}
                </div>
            )}
          </Card>

          {/* 2. SELECCIÓN DE SERVICIOS */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><Check size={20}/> Servicios</h2>
            </div>
            {serviciosLoading ? <p>Cargando servicios...</p> : (
                <div className={styles.servicesGrid}>
                    {servicios.filter(s => s.activo).map(serv => (
                        <ServiceCard 
                            key={serv.id_serv} 
                            servicio={serv} 
                            selected={selectedServices.includes(serv.id_serv)}
                            onToggle={() => toggleService(serv.id_serv)}
                        />
                    ))}
                </div>
            )}
          </Card>

          {/* 3. FECHA Y HORA */}
          <Card className={styles.sectionCard}>
             <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><Calendar size={20}/> Fecha y Hora</h2>
            </div>
            <div className={styles.dateRow}>
                <div style={{flex:1}}>
                    <Input 
                        type="date" 
                        label="Fecha del Turno" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        min={minDate}
                    />
                </div>
            </div>

            {selectedDate && selectedServices.length > 0 && (
                <div className={styles.slotsContainer}>
                    <p className={styles.subLabel}>Horarios Disponibles</p>
                    <div className={styles.slotsGrid}>
                        {horariosDisponibles.length > 0 ? horariosDisponibles.map(slot => (
                            <TimeSlot 
                                key={slot} 
                                time={slot} 
                                available={true} 
                                selected={selectedSlot === slot} 
                                onClick={() => setSelectedSlot(slot)} 
                            />
                        )) : (
                            <p className={styles.emptyText}>No hay disponibilidad para esta combinación.</p>
                        )}
                    </div>
                </div>
            )}
            
            {(!selectedDate || selectedServices.length === 0) && (
                <p className={styles.hintText}>Selecciona servicios y fecha para ver horarios.</p>
            )}
          </Card>
          
          {/* 4. OBSERVACIONES */}
          <Card className={styles.sectionCard}>
             <label className={styles.inputLabel}>Observaciones</label>
             <textarea 
                className={styles.textarea} 
                value={observaciones} 
                onChange={e => setObservaciones(e.target.value)}
                rows={3}
             />
          </Card>
        </div>

        <div className={styles.rightColumn}>
            <Card className={styles.summaryCard}>
                <h2 className={styles.summaryTitle}>Resumen</h2>
                
                <div className={styles.summaryRow}>
                    <span>Cliente</span>
                    <strong>{selectedCliente ? `${selectedCliente.nombre} ${selectedCliente.apellido}` : '-'}</strong>
                </div>
                
                <div className={styles.summaryRow}>
                    <span>Fecha</span>
                    <strong>{selectedDate ? new Date(selectedDate + 'T00:00').toLocaleDateString() : '-'}</strong>
                </div>

                <div className={styles.summaryRow}>
                    <span>Horario</span>
                    <strong>{selectedSlot || '-'}</strong>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.summaryRow}>
                    <span>Duración</span>
                    <span>{totalDuration} min</span>
                </div>

                <div className={styles.totalRow}>
                    <span>Total</span>
                    <span className={styles.totalPrice}>{formatCurrency(totalPrice)}</span>
                </div>

                <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleSubmit} 
                    loading={submitting}
                    disabled={!selectedCliente || !selectedDate || !selectedSlot || selectedServices.length === 0}
                >
                    Confirmar Turno
                </Button>
            </Card>
        </div>

      </div>
    </motion.div>
  );
};