// ========================================
// src/hooks/useServicios.js
// ========================================
import { useState, useCallback } from 'react';
import { serviciosApi } from '../api/serviciosApi';
import { useSwal } from './useSwal';

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError, confirmDelete } = useSwal();

  const fetchServicios = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await serviciosApi.getServicios(params);
      // Django REST pagination suele devolver { results: [...] } o directo el array
      setServicios(data.results || data);
      return data;
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const crearServicio = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await serviciosApi.crearServicio(data);
      setServicios(prev => [...prev, nuevo]);
      showSuccess('¡Servicio creado!', `${data.nombre} fue agregado exitosamente`);
      return nuevo;
    } catch (err) {
      showError('Error', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const actualizarServicio = useCallback(async (id_serv, data) => {
    setLoading(true);
    try {
      const actualizado = await serviciosApi.actualizarServicio(id_serv, data);
      // Actualizamos el estado local buscando por id_serv
      setServicios(prev => prev.map(s => s.id_serv === id_serv ? actualizado : s));
      showSuccess('¡Servicio actualizado!');
      return actualizado;
    } catch (err) {
      showError('Error', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const eliminarServicio = useCallback(async (id_serv, nombre = '') => {
    const confirmed = await confirmDelete(nombre || 'este servicio');
    if (!confirmed) return false;

    setLoading(true);
    try {
      await serviciosApi.eliminarServicio(id_serv);
      // Eliminamos del estado local buscando por id_serv
      setServicios(prev => prev.filter(s => s.id_serv !== id_serv));
      showSuccess('¡Eliminado!', 'El servicio fue eliminado');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirmDelete, showSuccess, showError]);

  return {
    servicios,
    loading,
    error,
    fetchServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    setServicios, // expuesto por si necesitas manipulación manual externa
  };
};