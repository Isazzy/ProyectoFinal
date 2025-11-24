import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, Check, Clock, Search } from 'lucide-react';
import { useTurnos } from '../../hooks/useTurnos';
import { useServicios } from '../../hooks/useServicios';
import { clientesApi } from '../../api/clientesApi'; // Necesario para buscar ID
import { useSwal } from '../../hooks/useSwal';
import { Card, Button, Input } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import styles from '../../styles/CrearTurno.module.css';

// ... (ServiceCard y TimeSlot se mantienen igual) ...
const ServiceCard = ({ servicio, selected, onToggle }) => (
  <motion.button
    className={`${styles.serviceCard} ${selected ? styles.selected : ''}`}
    onClick={onToggle}
    type="button" // Importante para no submit form
  >
    <div className={styles.serviceInfo}>
      <p className={styles.serviceName}>{servicio.nombre}</p>
      <p className={styles.serviceDuration}>{servicio.duracion} min</p>
    </div>
    <p className={styles.servicePrice}>{formatCurrency(servicio.precio)}</p>
    {selected && <div className={styles.checkMark}><Check size={16} /></div>}
  </motion.button>
);

const TimeSlot = ({ time, available, selected, onClick }) => (
  <motion.button
    className={`${styles.timeSlot} ${selected ? styles.selected : ''} ${!available ? styles.disabled : ''}`}
    onClick={available ? onClick : undefined}
    disabled={!available}
    type="button"
  >
    {time}
  </motion.button>
);

export const CrearTurno = () => {
  const navigate = useNavigate();
  const { crearTurno, fetchHorariosDisponibles, horariosDisponibles } = useTurnos();
  const { servicios, fetchServicios, loading: serviciosLoading } = useServicios();
  const { showWarning } = useSwal();

  // Estados
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Búsqueda de Cliente
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientesFound, setClientesFound] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null); // { id, nombre }

  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  useEffect(() => {
    if (selectedDate && selectedServices.length > 0) {
      fetchHorariosDisponibles(selectedDate, selectedServices);
    }
  }, [selectedDate, selectedServices, fetchHorariosDisponibles]);

  // Lógica de búsqueda de clientes
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (clienteSearch.length > 2 && !selectedCliente) {
        try {
          // Asumiendo que clientesApi.getClientes acepta params 'search'
          const res = await clientesApi.getClientes({ search: clienteSearch });
          setClientesFound(res.results || res);
        } catch (error) {
          console.error(error);
        }
      } else {
        setClientesFound([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [clienteSearch, selectedCliente]);

  const selectCliente = (c) => {
    setSelectedCliente(c);
    setClienteSearch(`${c.nombre} ${c.apellido}`);
    setClientesFound([]);
  };

  const { totalPrice, totalDuration } = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      // Ajuste: id puede venir como number o string
      const service = servicios.find(s => s.id_serv === id || s.id === id); 
      if (service) {
        acc.totalPrice += Number(service.precio);
        acc.totalDuration += service.duracion;
      }
      return acc;
    }, { totalPrice: 0, totalDuration: 0 });
  }, [selectedServices, servicios]);

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedSlot('');
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) return showWarning('Faltan datos', 'Selecciona servicios');
    if (!selectedDate) return showWarning('Faltan datos', 'Selecciona una fecha');
    if (!selectedSlot) return showWarning('Faltan datos', 'Selecciona un horario');
    if (!selectedCliente) return showWarning('Faltan datos', 'Selecciona un cliente de la lista');

    setSubmitting(true);
    try {
      // CORRECCIÓN: Usamos .user_id obligatoriamente.
      // El backend espera el ID de la tabla auth_user, no de la tabla cliente.
      const idUsuario = selectedCliente.user_id; 

      if (!idUsuario) {
        console.error("El cliente seleccionado no tiene user_id asociado:", selectedCliente);
        showWarning("Error", "Cliente inválido (sin usuario asociado).");
        setSubmitting(false);
        return;
      }

      await crearTurno({
        fecha: selectedDate,
        hora: selectedSlot,
        servicios_ids: selectedServices,
        cliente_id: idUsuario, // <--- Aquí estaba el error
        observaciones,
      });
      navigate('/turnos');
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <motion.div className={styles.crearTurnoPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/turnos')}><ChevronLeft size={24} /></button>
        <h1 className={styles.title}>Crear Nuevo Turno</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.formSection}>
          
          {/* SECCIÓN CLIENTE (Corregida) */}
          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Cliente</h2>
            <div style={{ position: 'relative' }}>
              <Input
                label="Buscar Cliente"
                value={clienteSearch}
                onChange={(e) => {
                  setClienteSearch(e.target.value);
                  setSelectedCliente(null); // Reset al escribir
                }}
                placeholder="Nombre o email..."
                icon={Search}
              />
              {clientesFound.length > 0 && (
                <ul className={styles.searchResults}>
                  {clientesFound.map(c => (
                    <li key={c.id} onClick={() => selectCliente(c)} className={styles.searchItem}>
                      {c.nombre} {c.apellido} ({c.email})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Servicios</h2>
            {serviciosLoading ? <p>Cargando...</p> : (
              <div className={styles.servicesGrid}>
                {servicios.filter(s => s.activo).map(servicio => (
                  // Usamos id_serv o id según venga del backend
                  <ServiceCard 
                    key={servicio.id || servicio.id_serv} 
                    servicio={servicio} 
                    selected={selectedServices.includes(servicio.id || servicio.id_serv)} 
                    onToggle={() => toggleService(servicio.id || servicio.id_serv)} 
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>Fecha y Horario</h2>
            <Input type="date" label="Fecha" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }} min={minDate} icon={Calendar} />
            
            {selectedDate && selectedServices.length > 0 && (
              <div className={styles.slotsSection}>
                 <p className={styles.slotsLabel}>Horarios:</p>
                 <div className={styles.slotsGrid}>
                   {(horariosDisponibles || []).map(slot => (
                     <TimeSlot key={slot} time={slot} available={true} selected={selectedSlot === slot} onClick={() => setSelectedSlot(slot)} />
                   ))}
                 </div>
              </div>
            )}
          </Card>
          
          {/* Observaciones ... */}
           <Card className={styles.card}>
             <h2 className={styles.sectionTitle}>Observaciones</h2>
             <textarea className={styles.textarea} value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} />
           </Card>

        </div>
        
        {/* Resumen Sidebar ... (Igual al anterior, solo asegurar que usa los estados) */}
        <div className={styles.summarySection}>
           <Card className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>Resumen</h2>
              <div className={styles.summaryTotal}>
                 <span>Total</span>
                 <span className={styles.totalPrice}>{formatCurrency(totalPrice)}</span>
              </div>
              <Button fullWidth icon={Check} loading={submitting} onClick={handleSubmit}>Reservar</Button>
           </Card>
        </div>
      </div>
    </motion.div>
  );
};