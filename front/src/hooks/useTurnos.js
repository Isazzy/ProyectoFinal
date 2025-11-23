// ========================================
// src/hooks/useTurnos.js
// ========================================
import { useState, useCallback } from 'react';
import { turnosApi } from '../api/turnosApi';
import { useSwal } from './useSwal';

export const useTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError, confirm, toast } = useSwal();

  const fetchTurnos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await turnosApi.getTurnos(params);
      setTurnos(data.results || data);
      return data;
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los turnos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchHorariosDisponibles = useCallback(async (fecha, serviciosIds = []) => {
    setLoading(true);
    try {
      const data = await turnosApi.getHorariosDisponibles(fecha, serviciosIds);
      setHorariosDisponibles(data.horarios || data);
      return data;
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los horarios disponibles');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const crearTurno = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await turnosApi.crearTurno(data);
      setTurnos(prev => [...prev, nuevo]);
      showSuccess('¡Turno reservado!', `Turno agendado para ${data.fecha} a las ${data.hora}`);
      return nuevo;
    } catch (err) {
      if (err.message?.includes('caja')) {
        showError('Caja no abierta', 'Debe abrir la caja antes de crear turnos');
      } else if (err.message?.includes('disponible')) {
        showError('Horario no disponible', 'El horario seleccionado ya no está disponible');
      } else {
        showError('Error', err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

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
      text: 'Esta acción notificará al cliente',
      confirmText: 'Sí, cancelar',
      icon: 'warning',
      isDanger: true,
    });
    if (!confirmed) return false;

    setLoading(true);
    try {
      const actualizado = await turnosApi.cancelarTurno(id);
      setTurnos(prev => prev.map(t => t.id === id ? actualizado : t));
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
    cancelarTurno,
    setTurnos,
  };
};