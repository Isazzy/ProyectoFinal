// ========================================
// src/hooks/useClientes.js
// ========================================
import { useState, useCallback } from 'react';
import { clientesApi } from '../api/clientesApi';
import { useSwal } from './useSwal';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, confirmDelete } = useSwal();

  const fetchClientes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await clientesApi.getClientes(params);
      setClientes(data.results || data);
    } catch (err) {
      console.error(err);
      showError('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const crearCliente = useCallback(async (data) => {
    setLoading(true);
    try {
      // Esto llama a /register/ en el backend
      const nuevo = await clientesApi.crearCliente(data);
      // Recargamos la lista para asegurar que venga con todos los datos formateados
      await fetchClientes(); 
      showSuccess('¡Cliente registrado!', `Se ha creado el usuario para ${data.nombre}`);
      return nuevo;
    } catch (err) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      showError('Error al crear', msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchClientes, showSuccess, showError]);

  const actualizarCliente = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await clientesApi.actualizarCliente(id, data);
      setClientes(prev => prev.map(c => c.id === id ? actualizado : c));
      showSuccess('¡Actualizado!', 'Datos del cliente actualizados correctamente.');
      return actualizado;
    } catch (err) {
      showError('Error al actualizar', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const eliminarCliente = useCallback(async (id, nombre) => {
    const confirmed = await confirmDelete(nombre);
    if (!confirmed) return false;

    setLoading(true);
    try {
      await clientesApi.eliminarCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      showSuccess('¡Eliminado!', 'El cliente ha sido eliminado.');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirmDelete, showSuccess, showError]);

  return {
    clientes,
    loading,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  };
};