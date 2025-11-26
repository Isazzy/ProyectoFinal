import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, Check, Scissors, CreditCard } from 'lucide-react';
import { useBooking } from '../../hooks/useBooking';
import { Button, Input, Modal } from '../../components/ui';
import styles from '../../styles/BookingPage.module.css';
import { formatCurrency } from '../../utils/formatters';
import { turnosApi } from '../../api/turnosApi';
import { useSwal } from '../../hooks/useSwal';

export const BookingPage = () => {

  const { 
    step, servicios, bookingData, setBookingData, horariosDisponibles, loading, 
    selectServicio, selectFecha, selectHora, confirmarReserva, backStep,
    isAuthenticated, crearTurnoSiNoExiste
  } = useBooking();

  const { showSuccess, showError } = useSwal();

  const [showPagoModal, setShowPagoModal] = useState(false);
  const [archivo, setArchivo] = useState(null);

  // ==========================
  // PREVIEW DEL COMPROBANTE
  // ==========================
  const [modalPreviewOpen, setModalPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const verPreviaComprobante = () => {
    if (!archivo) {
      showError("Error", "Subí un archivo primero.");
      return;
    }

    const tempUrl = URL.createObjectURL(archivo);
    setPreviewUrl(tempUrl);
    setModalPreviewOpen(true);
  };

  const subirComprobante = async () => {
    if (!archivo) {
      showError("Error", "Subí un archivo primero.");
      return;
    }

    if (!bookingData.idTurno) {
      showError("Error", "El turno no se detectó correctamente.");
      return;
    }

    try {
      await turnosApi.subirComprobante(bookingData.idTurno, archivo, "seña");

      await showSuccess("Listo", "Comprobante enviado con éxito.");
      setShowPagoModal(false);

      setBookingData(prev => ({
        ...prev,
        estado_pago: "seña"
      }));

    } catch (error) {
      console.error(error);
      showError("Error", "No se pudo subir el comprobante.");
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1 className={styles.title}>Reserva tu Turno</h1>
        <p className={styles.subtitle}>
            {step === 0 && "Elige el tratamiento ideal para vos"}
            {step === 1 && "Seleccioná día y horario"}
            {step === 2 && "Confirmá los detalles"}
        </p>
      </div>

      <div className={styles.steps}>
        {[0, 1, 2].map(s => (
            <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`} />
        ))}
      </div>

      {/* ========================= */}
      {/* PASO 0 */}
      {/* ========================= */}
      {step === 0 && (
        <motion.div 
            className={styles.grid}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
        >
            {servicios.map(serv => (
                <div 
                  key={serv.id_serv} 
                  className={styles.serviceCard} 
                  onClick={() => selectServicio(serv)}
                >
                    <div className={styles.serviceIcon}><Scissors size={24}/></div>
                    <h3>{serv.nombre}</h3>
                    <p style={{fontSize:'0.9rem', color:'#666'}}>{serv.duracion} min</p>
                    <p style={{fontWeight:'bold', marginTop: 10}}>{formatCurrency(serv.precio)}</p>
                </div>
            ))}
        </motion.div>
      )}

      {/* ========================= */}
      {/* PASO 1 */}
      {/* ========================= */}
      {step === 1 && (
        <motion.div 
            className={styles.dateContainer}
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
        >
            <div style={{display:'flex', alignItems:'center', marginBottom: 20}}>
                <Button variant="ghost" onClick={backStep} size="sm">
                    <ChevronLeft/> Volver
                </Button>
                <h3 style={{flex:1, margin:0}}>
                    {bookingData.servicio?.nombre} ({bookingData.servicio?.duracion} min)
                </h3>
            </div>

            <div style={{maxWidth: 300, margin: '0 auto'}}>
                <Input 
                    type="date"
                    label="Seleccioná un día"
                    value={bookingData.fecha} 
                    onChange={selectFecha}
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            {bookingData.fecha && (
              <>
                <h4 style={{marginTop: 20, color:'#64748b'}}>Horarios</h4>
                
                <div className={styles.slotsGrid}>
                  {loading ? (
                    <p>Buscando horarios...</p>
                  ) : (
                    horariosDisponibles.length > 0 ? (
                      horariosDisponibles.map((slot) => (

                        <button
                          key={slot.hora}
                          className={`${styles.slotBtn} ${
                            (slot.estado === 'ocupado' || 
                             slot.estado === 'pasado' ||
                             slot.id_turno)
                              ? styles.slotOcupado
                              : ''
                          } ${
                            bookingData.hora === slot.hora ? styles.slotSelected : ''
                          }`}

                          onClick={() => {
                            if (
                              slot.estado === "ocupado" ||
                              slot.estado === "pasado" ||
                              slot.id_turno
                            ) {
                              showError("No disponible", "Este horario ya fue reservado.");
                              return;
                            }

                            selectHora(slot.hora);
                          }}

                          disabled={
                            slot.estado !== "disponible" || slot.id_turno
                          }
                        >
                          {slot.hora}
                        </button>

                      ))
                    ) : (
                      <p className={styles.noSlots}>No hay turnos disponibles.</p>
                    )
                  )}
                </div>
              </>
            )}

        </motion.div>
      )}

      {/* ========================= */}
      {/* PASO 2 */}
      {/* ========================= */}
      {step === 2 && (
        <motion.div 
            className={styles.summaryCard}
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
        >
            <h2 style={{marginBottom: 30}}>Resumen del turno</h2>
            
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
                <div style={{background: '#fff7ed', color: '#c2410c', padding: 10, borderRadius: 8}}>
                    ⚠️ Tenés que iniciar sesión para confirmar.
                </div>
            )}

            <div style={{display: 'flex', gap: 10, marginTop: 20}}>

                <Button variant="outline" onClick={backStep} fullWidth>Modificar</Button>

                <Button 
                  variant="secondary"
                  icon={CreditCard}
                  fullWidth
                  onClick={async () => {
                    const turnoId = await crearTurnoSiNoExiste();
                    if (turnoId) setShowPagoModal(true);
                  }}
                >
                  Pagar / Comprobante
                </Button>

                <Button
                    variant="primary" 
                    onClick={confirmarReserva} 
                    fullWidth 
                    loading={loading} 
                    icon={Check}
                >
                    {isAuthenticated ? 'Confirmar' : 'Iniciar Sesión'}
                </Button>
            </div>
        </motion.div>
      )}

      {/* ========================= */}
      {/* MODAL PAGO */}
      {/* ========================= */}
      {showPagoModal && (
        <div className={styles.modalOverlay}>
          <motion.div 
            className={styles.modalCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className={styles.modalTitle}>Datos de pago</h2>

            <p><b>Alias:</b> salon.romi.boutique</p>
            <p><b>CBU:</b> 0000003100045539852040</p>
            <p><b>Titular:</b> Romina - Salón Boutique</p>

            <hr />

            <label className={styles.fileLabel}>Subir comprobante:</label>

            <input
              type="file"
              className={styles.fileInput}
              onChange={(e) => setArchivo(e.target.files[0])}
            />

            <Button
              variant="secondary"
              fullWidth
              onClick={verPreviaComprobante}
              style={{ marginTop: 10 }}
            >
              Ver comprobante antes de enviar
            </Button>

            <div style={{display:'flex', gap:10, marginTop: 20}}>
              <Button variant="primary" fullWidth onClick={subirComprobante}>
                Enviar comprobante
              </Button>

              <Button variant="outline" fullWidth onClick={() => setShowPagoModal(false)}>
                Cerrar
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================= */}
      {/* MODAL PREVIEW DEL COMPROBANTE */}
      {/* ========================= */}
      <Modal
        isOpen={modalPreviewOpen}
        onClose={() => setModalPreviewOpen(false)}
        title="Vista previa del comprobante"
        size="lg"
      >
        {previewUrl &&
          (previewUrl.toLowerCase().includes(".pdf") ? (
            <iframe
              src={previewUrl}
              style={{
                width: "100%",
                height: "75vh",
                border: "none",
              }}
              title="Vista previa PDF"
            />
          ) : (
            <img
              src={previewUrl}
              alt="comprobante"
              style={{
                width: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
              }}
            />
          ))}
      </Modal>

    </div>
  );
};
