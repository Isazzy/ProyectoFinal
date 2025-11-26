// src/hooks/useBooking.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { turnosApi } from '../api/turnosApi';
import { useServicios } from './useServicios';
import { useAuth } from './useAuth';
import { useSwal } from './useSwal';

export const useBooking = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { servicios, fetchServicios } = useServicios();
  const { showSuccess, showError, confirm } = useSwal();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  const [bookingData, setBookingData] = useState({
    servicio: null,
    fecha: '',
    hora: '',
    idTurno: null,
  });

  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // CARGAR SERVICIOS
  useEffect(() => {
    fetchServicios({ activo: true });
  }, [fetchServicios]);

  // ================================
  // VALIDAR DÍA DEL SERVICIO
  // ================================
  const validarDiaServicio = (fechaStr, servicio) => {
    if (!servicio || !servicio.dias_disponibles) return null;

    const [y, m, d] = fechaStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const diasSemana = [
      'domingo', 'lunes', 'martes', 'miercoles',
      'jueves', 'viernes', 'sabado'
    ];
    const diaSeleccionado = diasSemana[dateObj.getDay()];

    const diasPermitidos = servicio.dias_disponibles.map(d =>
      d.toLowerCase().trim()
    );

    if (!diasPermitidos.includes(diaSeleccionado)) {
      return `Este servicio solo está disponible los: ${diasPermitidos.join(', ')}.`;
    }

    return null;
  };

  // ================================
  // CONSULTAR HORARIOS AL BACKEND
  // ================================
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
      const servicioId = bookingData.servicio.id_serv || bookingData.servicio.id;

      const data = await turnosApi.getHorariosDisponibles(
        fechaStr,
        [servicioId]
      );

      if (data.error || data.mensaje) {
        setDateError(data.error || data.mensaje);
        setHorariosDisponibles([]);
        return;
      }

      let horariosFinales = [];

      if (Array.isArray(data.horarios) && data.horarios.length > 0) {
        horariosFinales = data.horarios;

      } else if (Array.isArray(data.disponibilidad)) {
        const now = new Date();
        const fechaSeleccionada = new Date(`${fechaStr}T00:00`);

        horariosFinales = data.disponibilidad.map(hora => {
          const dateTime = new Date(`${fechaStr}T${hora}:00`);
          let estado = 'disponible';

          if (
            fechaSeleccionada.toDateString() === now.toDateString() &&
            dateTime <= now
          ) {
            estado = 'pasado';
          }

          return { hora, estado };
        });
      }

      setHorariosDisponibles(horariosFinales);

    } catch (error) {
      console.error(error);
      setDateError("No se pudo verificar la disponibilidad.");
      setHorariosDisponibles([]);
    } finally {
      setLoading(false);
    }

  }, [bookingData.servicio]);

  // ================================
  // SELECCIONAR SERVICIO
  // ================================
  const selectServicio = (servicioNuevo) => {
    const actual = bookingData.servicio;

    if (actual && actual.tipo_serv === servicioNuevo.tipo_serv) {
      showError(
        "No permitido",
        `No podés elegir dos servicios de ${servicioNuevo.tipo_serv}.`
      );
      return;
    }

    setBookingData(prev => ({
      ...prev,
      servicio: servicioNuevo,
      fecha: '',
      hora: '',
      idTurno: null,
    }));

    setHorariosDisponibles([]);
    setDateError('');
    setStep(1);
  };

  // ================================
  // SELECCIONAR FECHA
  // ================================
  const selectFecha = (e) => {
    const fecha = e.target.value;
    setBookingData(prev => ({
      ...prev,
      fecha,
      hora: '',
      idTurno: null
    }));

    consultarBackend(fecha);
  };

  // ================================
  // SELECCIONAR HORA
  // ================================
  const selectHora = (hora) => {
    setBookingData(prev => ({
      ...prev,
      hora,
      idTurno: null
    }));

    setStep(2);
  };

  // ==========================================
  // CREAR TURNO SI NO EXISTE — MUY IMPORTANTE
  // ==========================================
  const crearTurnoSiNoExiste = async () => {
    try {
      if (bookingData.idTurno) return bookingData.idTurno;

      if (!bookingData.servicio || !bookingData.fecha || !bookingData.hora) {
        throw new Error("Faltan datos del turno.");
      }

      const payload = {
        fecha_hora_inicio: `${bookingData.fecha}T${bookingData.hora}:00`,
        servicios: [bookingData.servicio?.id_serv],
        observaciones: "Reserva Web"
      };

      const creado = await turnosApi.crearTurno(payload);
      const nuevoId = creado.id ?? creado.id_turno;

      setBookingData(prev => ({ ...prev, idTurno: nuevoId }));

      return nuevoId;

    } catch (error) {
      console.error("ERROR CREANDO TURNO:", error.response?.data || error);
      showError("Error", "No se pudo crear el turno.");
      throw error;
    }
  };

  // ================================
  // CONFIRMAR RESERVA
  // ================================
  const confirmarReserva = async () => {
    if (!isAuthenticated) return navigate('/login');

    const textoConfirm = `Servicio: ${bookingData.servicio.nombre}\nFecha: ${bookingData.fecha} ${bookingData.hora}`;

    if (await confirm({ title: "Confirmar Reserva", text: textoConfirm })) {
      try {
        setLoading(true);

        await crearTurnoSiNoExiste();

        await showSuccess("¡Reservado!", "Te esperamos.");
        navigate('/');

      } catch (error) {
        console.error(error);
        const msg =
          error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          error.response?.data?.error ||
          error.message ||
          "Error al reservar.";

        showError("Error", msg);
      } finally {
        setLoading(false);
      }
    }
  };

  // ================================
  // ATRÁS
  // ================================
  const backStep = () => {
    setStep(prev => prev - 1);
    setDateError('');
  };

  return {
    step,
    servicios,
    bookingData,
    setBookingData,    // <-- 🔥 AHORA EXPUESTO
    horariosDisponibles,
    dateError,
    loading,
    selectServicio,
    selectFecha,
    selectHora,
    confirmarReserva,
    backStep,
    isAuthenticated,
    crearTurnoSiNoExiste, // <-- 🔥 EXPORTADO PARA BookingPage
  };
};
