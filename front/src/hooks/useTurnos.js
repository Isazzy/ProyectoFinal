// ========================================
// src/hooks/useTurnos.js
// ========================================
import { useState, useCallback } from 'react';
import { turnosApi } from '../api/turnosApi';
import { useSwal } from './useSwal';

export const useTurnos = () => {
  // Inicializamos siempre como array para evitar errores de .filter/.map
  const [turnos, setTurnos] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError, confirm, toast } = useSwal();

  const fetchTurnos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await turnosApi.getTurnos(params);
      
      // Manejo seguro de listas (array directo o paginado)
      let lista = [];
      if (Array.isArray(data)) {
        lista = data;
      } else if (data && Array.isArray(data.results)) {
        lista = data.results;
      }
      
      setTurnos(lista);
      return data;
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los turnos');
      setTurnos([]); // Limpiar en caso de error
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchHorariosDisponibles = useCallback(async (fecha, serviciosIds = []) => {
    setLoading(true);
    // Limpiamos los horarios anteriores mientras cargamos los nuevos
    setHorariosDisponibles([]); 
    try {
      const data = await turnosApi.getHorariosDisponibles(fecha, serviciosIds);
      
      // CORRECCIÓN: El backend devuelve { disponibilidad: [...] }
      // Nos aseguramos de guardar solo el array.
      const listaHorarios = data.disponibilidad || [];
      
      setHorariosDisponibles(listaHorarios);
      return data;
    } catch (err) {
      setError(err.message);
      // No mostramos alerta de error bloqueante si es solo que no hay horarios, 
      // pero si falló la red sí. Opcional: manejar silenciosamente.
      console.error("Error cargando horarios:", err);
      setHorariosDisponibles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearTurno = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await turnosApi.crearTurno(data);
      // Agregamos el nuevo turno a la lista local
      setTurnos(prev => [...prev, nuevo]);
      showSuccess('¡Turno reservado!', `Turno agendado correctamente.`);
      return nuevo;
    } catch (err) {
      // Manejo de errores específicos del backend
      let msg = err.message;
      if (err.response && err.response.data) {
        // Si el backend envía { error: "Mensaje" } o detalles de validación
        msg = err.response.data.error || JSON.stringify(err.response.data);
      }
      showError('No se pudo crear el turno', msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // --- NUEVA FUNCIÓN AGREGADA ---
  const confirmarTurno = useCallback(async (id) => {
    setLoading(true);
    try {
      const actualizado = await turnosApi.confirmarTurno(id);
      // Actualizamos el estado local
      setTurnos(prev => prev.map(t => t.id === id ? actualizado : t));
      toast('Turno confirmado', 'success');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, showError]);

  const completarTurno = useCallback(async (id, clienteNombre = '') => {
    const confirmed = await confirm({
      title: '¿Marcar como completado?',
      text: clienteNombre ? `El turno de ${clienteNombre} será marcado como completado` : '',
      confirmText: 'Sí, completar',
      icon: 'question',
    });
    if (!confirmed) return false;

    setLoading(true);
    try {
      const actualizado = await turnosApi.completarTurno(id);
      setTurnos(prev => prev.map(t => t.id === id ? actualizado : t));
      toast('Turno completado', 'success');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirm, toast, showError]);

  const cancelarTurno = useCallback(async (id) => {
    const confirmed = await confirm({
      title: '¿Cancelar turno?',
      text: 'Esta acción no se puede deshacer fácilmente.',
      confirmText: 'Sí, cancelar',
      icon: 'warning',
      isDanger: true,
    });
    if (!confirmed) return false;

    setLoading(true);
    try {
      const actualizado = await turnosApi.cancelarTurno(id);
      
      // 2. Tu lógica robusta para actualizar el estado local
      if (actualizado && actualizado.id) {
          // Si el backend devuelve el objeto completo
          setTurnos(prev => prev.map(t => t.id === id ? actualizado : t));
      } else {
          // Si el backend solo devuelve { status: 'ok' }, actualizamos manualmente
          setTurnos(prev => prev.map(t => t.id === id ? { ...t, estado: 'cancelado' } : t));
      }
      
      toast('Turno cancelado', 'info');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirm, toast, showError]);

  return {
    turnos,
    horariosDisponibles,
    loading,
    error,
    fetchTurnos,
    fetchHorariosDisponibles,
    crearTurno,
    completarTurno,
    confirmarTurno, // <--- AHORA SÍ SE EXPORTA
    cancelarTurno,
    setTurnos,
  };
};