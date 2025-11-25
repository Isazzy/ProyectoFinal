import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, Check, Scissors, CreditCard } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { Button, Input, Card } from '../../components/ui';
import styles from '../../styles/BookingPage.module.css';
import { formatCurrency } from '../../utils/formatters';

export const BookingPage = () => {
  const { 
    step, servicios, bookingData, horariosDisponibles, loading, 
    selectServicio, selectFecha, selectHora, confirmarReserva, backStep,
    isAuthenticated
  } = useBooking();

  return (
    <div className={styles.container}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Reserva tu Turno</h1>
        <p className={styles.subtitle}>
            {step === 0 && "Elige el tratamiento ideal para ti"}
            {step === 1 && "Selecciona el día y horario"}
            {step === 2 && "Confirma los detalles"}
        </p>
      </div>

      {/* Indicador de Pasos */}
      <div className={styles.steps}>
        {[0, 1, 2].map(s => (
            <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`} />
        ))}
      </div>

      {/* --- PASO 0: SERVICIOS --- */}
      {step === 0 && (
        <motion.div 
            className={styles.grid}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
            {servicios.map(serv => (
                <div key={serv.id_serv} className={styles.serviceCard} onClick={() => selectServicio(serv)}>
                    <div className={styles.serviceIcon}><Scissors size={24}/></div>
                    <h3>{serv.nombre}</h3>
                    <p style={{fontSize:'0.9rem', color:'#666'}}>{serv.duracion} min</p>
                    <p style={{fontWeight:'bold', marginTop: 10}}>{formatCurrency(serv.precio)}</p>
                </div>
            ))}
        </motion.div>
      )}

      {/* --- PASO 1: FECHA Y HORA --- */}
      {step === 1 && (
        <motion.div 
            className={styles.dateContainer}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        >
            <div style={{display:'flex', alignItems:'center', marginBottom: 20}}>
                <Button variant="ghost" onClick={backStep} size="sm"><ChevronLeft/> Volver</Button>
                <h3 style={{flex:1, margin:0}}>
                    {bookingData.servicio?.nombre} ({bookingData.servicio?.duracion} min)
                </h3>
            </div>

            <div style={{maxWidth: 300, margin: '0 auto'}}>
                <Input 
                    type="date" 
                    label="Selecciona un día" 
                    value={bookingData.fecha} 
                    onChange={selectFecha}
                    min={new Date().toISOString().split('T')[0]} // No permitir pasado
                />
            </div>

            {bookingData.fecha && (
                <>
                    <h4 style={{marginTop: 20, color:'#64748b'}}>Horarios Disponibles</h4>
                    <div className={styles.slotsGrid}>
                        {loading ? <p>Buscando horarios...</p> : (
                            horariosDisponibles.length > 0 ? (
                                horariosDisponibles.map(hora => (
                                    <button key={hora} className={styles.slotBtn} onClick={() => selectHora(hora)}>
                                        {hora}
                                    </button>
                                ))
                            ) : (
                                <p className={styles.noSlots}>No hay turnos disponibles para esta fecha.</p>
                            )
                        )}
                    </div>
                </>
            )}
        </motion.div>
      )}

      {/* --- PASO 2: CONFIRMACIÓN --- */}
      {step === 2 && (
        <motion.div 
            className={styles.summaryCard}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        >
            <h2 style={{marginBottom: 30}}>Resumen de Reserva</h2>
            
            <div className={styles.summaryItem}>
                <Scissors size={20} color="#9B8DC5" style={{marginBottom:5}}/>
                <h3>{bookingData.servicio?.nombre}</h3>
                <p>{bookingData.servicio?.descripcion}</p>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                <div className={styles.summaryItem}>
                    <Calendar size={20} color="#9B8DC5"/>
                    <p>Fecha</p>
                    <strong>{new Date(bookingData.fecha + 'T00:00').toLocaleDateString()}</strong>
                </div>
                <div className={styles.summaryItem}>
                    <Clock size={20} color="#9B8DC5"/>
                    <p>Hora</p>
                    <strong>{bookingData.hora}</strong>
                </div>
            </div>

            <span className={styles.priceTag}>
                {formatCurrency(bookingData.servicio?.precio)}
            </span>

            {!isAuthenticated && (
                <div style={{background: '#fff7ed', color: '#c2410c', padding: 10, borderRadius: 8, marginBottom: 20, fontSize: '0.9rem'}}>
                    ⚠️ Debes iniciar sesión para confirmar el turno. Serás redirigido al login.
                </div>
            )}

            <div style={{display: 'flex', gap: 10, marginTop: 20}}>
                <Button variant="outline" onClick={backStep} fullWidth>Modificar</Button>
                <Button variant="primary" onClick={confirmarReserva} fullWidth loading={loading} icon={Check}>
                    {isAuthenticated ? 'Confirmar Reserva' : 'Iniciar Sesión y Confirmar'}
                </Button>
            </div>
        </motion.div>
      )}

    </div>
  );
};