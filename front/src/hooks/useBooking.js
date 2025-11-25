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

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  const [bookingData, setBookingData] = useState({
    servicio: null,
    fecha: '',
    hora: '',
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  // 1. Validación Frontend rápida
  const validarDiaServicio = (fechaStr, servicio) => {
      if (!servicio || !servicio.dias_disponibles) return true;
      
      const [year, month, day] = fechaStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day); 
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const diaSeleccionado = diasSemana[dateObj.getDay()];

      const diasPermitidos = servicio.dias_disponibles.map(d => d.toLowerCase().trim());

      if (!diasPermitidos.includes(diaSeleccionado)) {
          return `Este servicio solo está disponible los: ${diasPermitidos.join(', ')}.`;
      }
      return null;
  };

  // 2. Consulta al Backend
  const consultarBackend = useCallback(async (fechaStr) => {
    if (!fechaStr || !bookingData.servicio) return;
    
    const errorDia = validarDiaServicio(fechaStr, bookingData.servicio);
    if (errorDia) {
        setDateError(errorDia);
        setHorariosDisponibles([]);
        return;
    }

    setLoading(true);
    setDateError(''); 

    try {
        // LLAMADA CORREGIDA: usa getDisponibilidad
        // Pasamos el ID como string o array, la API lo maneja
        const data = await turnosApi.getHorariosDisponibles(fechaStr, [bookingData.servicio.id_serv || bookingData.servicio.id]);
        
        if (data.error) {
            setDateError(data.error);
            setHorariosDisponibles([]);
        } else if (data.mensaje) {
            setDateError(data.mensaje);
            setHorariosDisponibles([]);
        } else {
            setHorariosDisponibles(data.disponibilidad || []);
        }

    } catch (error) {
        console.error(error);
        setDateError('No se pudo verificar la disponibilidad.');
    } finally {
        setLoading(false);
    }
  }, [bookingData.servicio]);

  // --- HANDLERS ---

  const selectServicio = (servicio) => {
      setBookingData(prev => ({ ...prev, servicio, hora: '', fecha: '' })); 
      setStep(1);
      setHorariosDisponibles([]);
      setDateError('');
  };

  const selectFecha = (e) => {
      const fecha = e.target.value;
      setBookingData(prev => ({ ...prev, fecha, hora: '' }));
      consultarBackend(fecha);
  };

  const selectHora = (hora) => {
      setBookingData(prev => ({ ...prev, hora }));
      setStep(2);
  };

  const confirmarReserva = async () => {
      if (!isAuthenticated) {
        navigate('/login'); 
        return;
      }

      const textoConfirm = `Servicio: ${bookingData.servicio.nombre}\nFecha: ${bookingData.fecha} ${bookingData.hora}`;
      
      if (await confirm({ title: 'Confirmar Reserva', text: textoConfirm })) {
          setLoading(true);
          try {
              const payload = {
                  fecha_hora_inicio: `${bookingData.fecha}T${bookingData.hora}:00`,
                  servicios: [bookingData.servicio.id_serv || bookingData.servicio.id],
                  observaciones: 'Reserva Web'
              };

              await turnosApi.crearTurno(payload);
              await showSuccess('¡Reservado!', 'Te esperamos.');
              
              // Redirigir al dashboard o landing según rol
              // Si es cliente, idealmente a "Mis Turnos" (si existe), si no, al home.
              navigate('/'); 

          } catch (error) {
              const msg = error.response?.data?.detail || 'Error al reservar.';
              showError('Error', msg);
          } finally {
              setLoading(false);
          }
      }
  };

  const backStep = () => {
      setStep(prev => prev - 1);
      setDateError('');
  };

  return {
      step,
      servicios,
      bookingData,
      horariosDisponibles,
      dateError,
      loading,
      selectServicio,
      selectFecha,
      selectHora,
      confirmarReserva,
      backStep,
      isAuthenticated
  };
};