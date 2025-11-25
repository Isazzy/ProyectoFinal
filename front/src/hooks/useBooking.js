import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { turnosApi } from '../api/turnosApi';
import { useServicios } from './useServicios';
import { useAuth } from './useAuth';
import { useSwal } from './useSwal';

export const useBooking = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { servicios, fetchServicios } = useServicios();
  const { showSuccess, showError, confirm } = useSwal();

  // Pasos: 0=Servicio, 1=Fecha/Hora, 2=Confirmación
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Datos de la reserva
  const [bookingData, setBookingData] = useState({
    servicio: null, // Objeto servicio completo
    fecha: '',      // YYYY-MM-DD
    hora: '',       // HH:MM
  });

  // Disponibilidad
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // 1. Cargar Servicios al iniciar
  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  // 2. Calcular Horarios cuando cambia la fecha o el servicio
  const calcularDisponibilidad = useCallback(async (fechaStr) => {
    if (!fechaStr || !bookingData.servicio) return;
    setLoading(true);
    
    try {
        // Traemos los turnos ya ocupados de ese día
        const ocupadosData = await turnosApi.getTurnosPorFecha(fechaStr);
        const ocupados = ocupadosData.results || ocupadosData;

        // Configuración del Local (Idealmente vendría de API)
        const APERTURA = 9; // 9:00
        const CIERRE = 20;  // 20:00
        const INTERVALO = 30; // minutos

        let slots = [];
        let currentTime = new Date(`${fechaStr}T09:00:00`);
        const endTime = new Date(`${fechaStr}T20:00:00`);
        const duracionServicio = bookingData.servicio.duracion; // en minutos

        // Generamos todos los slots posibles
        while (currentTime < endTime) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime.getTime() + duracionServicio * 60000);

            // Si el servicio termina después del cierre, no sirve
            if (slotEnd > endTime) break;

            // Verificar colisión con turnos ocupados
            const isBusy = ocupados.some(t => {
                const tStart = new Date(t.fecha_hora_inicio);
                // Estimamos fin del turno ocupado (si el backend no lo manda, asumimos 30 min o lo que sea)
                // Lo ideal es que el backend mande 'fecha_hora_fin'
                const tEnd = t.fecha_hora_fin ? new Date(t.fecha_hora_fin) : new Date(tStart.getTime() + 30 * 60000);
                
                // Lógica de superposición de rangos
                return (slotStart < tEnd && slotEnd > tStart);
            });

            // Verificar si es pasado (si la fecha es hoy)
            const now = new Date();
            const isPast = slotStart < now;

            if (!isBusy && !isPast) {
                slots.push(slotStart.toTimeString().slice(0, 5)); // "09:00"
            }

            // Avanzamos por intervalo
            currentTime = new Date(currentTime.getTime() + INTERVALO * 60000);
        }

        setHorariosDisponibles(slots);

    } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo verificar disponibilidad');
    } finally {
        setLoading(false);
    }
  }, [bookingData.servicio]);

  // --- HANDLERS ---

  const selectServicio = (servicio) => {
      setBookingData(prev => ({ ...prev, servicio, hora: '' })); // Reset hora si cambia servicio
      setStep(1);
  };

  const selectFecha = (e) => {
      const fecha = e.target.value;
      setBookingData(prev => ({ ...prev, fecha, hora: '' }));
      calcularDisponibilidad(fecha);
  };

  const selectHora = (hora) => {
      setBookingData(prev => ({ ...prev, hora }));
      setStep(2); // Avanzar a confirmación
  };

  const confirmarReserva = async () => {
      if (!isAuthenticated) {
          navigate('/login?redirect=/reservar');
          return;
      }

      if (await confirm({ title: 'Confirmar Turno', text: '¿Deseas reservar este turno?' })) {
          setLoading(true);
          try {
              // Construir ISO String
              const fechaHoraInicio = `${bookingData.fecha}T${bookingData.hora}:00`;

              // Payload para el backend
              const payload = {
                  fecha_hora_inicio: fechaHoraInicio,
                  servicios: [bookingData.servicio.id_serv], // Array de IDs
                  observaciones: 'Reserva Web Cliente',
                  cliente: user.id // Opcional si el backend usa request.user
              };

              await turnosApi.crearTurno(payload);
              
              await showSuccess('¡Turno Reservado!', 'Te esperamos en nuestro centro.');
              navigate('/dashboard'); // O a "Mis Turnos"

          } catch (error) {
              console.error(error);
              const msg = error.response?.data?.detail || 'No se pudo reservar.';
              showError('Error', msg);
          } finally {
              setLoading(false);
          }
      }
  };

  const backStep = () => setStep(prev => prev - 1);

  return {
      step,
      servicios,
      bookingData,
      horariosDisponibles,
      loading,
      selectServicio,
      selectFecha,
      selectHora,
      confirmarReserva,
      backStep,
      isAuthenticated
  };
};