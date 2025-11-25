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
  
  // Mensaje de error específico para la fecha (ej: "Cerrado los martes")
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

  // ------------------------------------------------------------
  // VALIDACIÓN PREVIA DE DÍAS (Lógica de Frontend rápida)
  // ------------------------------------------------------------
  const validarDiaServicio = (fechaStr, servicio) => {
      if (!servicio || !servicio.dias_disponibles) return true;
      
      // Creamos fecha asegurando la zona horaria local para obtener el día correcto
      const [year, month, day] = fechaStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day); // Mes es 0-indexado
      
      const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const diaSeleccionado = diasSemana[dateObj.getDay()];

      // Normalizar array del backend (por si viene con mayúsculas o espacios)
      const diasPermitidos = servicio.dias_disponibles.map(d => d.toLowerCase().trim());

      if (!diasPermitidos.includes(diaSeleccionado)) {
          return `Este servicio solo está disponible los: ${diasPermitidos.join(', ')}.`;
      }
      return null;
  };

  // ------------------------------------------------------------
  // CALCULAR DISPONIBILIDAD (Consulta al Backend)
  // ------------------------------------------------------------
  const consultarBackend = useCallback(async (fechaStr) => {
    if (!fechaStr || !bookingData.servicio) return;
    
    // 1. Validación rápida de día
    const errorDia = validarDiaServicio(fechaStr, bookingData.servicio);
    if (errorDia) {
        setDateError(errorDia);
        setHorariosDisponibles([]);
        return;
    }

    setLoading(true);
    setDateError(''); // Limpiar errores previos

    try {
        // Llamamos a TU endpoint de backend que calcula todo
        const data = await turnosApi.getDisponibilidad(fechaStr, bookingData.servicio.id_serv);
        
        if (data.error) {
            setDateError(data.error);
            setHorariosDisponibles([]);
        } else if (data.mensaje) {
            // El backend dice "Cerrado los martes" o similar
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
        // Guardar intento para redirigir post-login (opcional)
        navigate('/login'); 
        return;
      }

      const textoConfirm = `Servicio: ${bookingData.servicio.nombre}\nFecha: ${bookingData.fecha} ${bookingData.hora}`;
      
      if (await confirm({ title: 'Confirmar Reserva', text: textoConfirm })) {
          setLoading(true);
          try {
              const payload = {
                  fecha_hora_inicio: `${bookingData.fecha}T${bookingData.hora}:00`,
                  servicios: [bookingData.servicio.id_serv],
                  observaciones: 'Reserva Web'
                  // Cliente lo toma el backend del token
              };

              await turnosApi.crearTurno(payload);
              await showSuccess('¡Reservado!', 'Te esperamos.');
              navigate('/dashboard');

          } catch (error) {
              const msg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error al reservar.';
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
      dateError, // Exportamos el error para mostrarlo en UI
      loading,
      selectServicio,
      selectFecha,
      selectHora,
      confirmarReserva,
      backStep,
      isAuthenticated
  };
};