import { useState, useCallback } from 'react';
import { clientesApi } from '../api/clientesApi';
import { useSwal } from './useSwal';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, confirm } = useSwal();

  const fetchClientes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await clientesApi.getClientes(params);
      setClientes(data.results || data);
    } catch (error) {
      console.error(error);
      // No mostrar error bloqueante en carga inicial
    } finally {
      setLoading(false);
    }
  }, []);

  const crearCliente = async (data) => {
    setLoading(true);
    try {
      await clientesApi.crearCliente(data);
      await showSuccess('Creado', 'Cliente registrado exitosamente');
      fetchClientes();
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al crear cliente';
      showError('Error', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCliente = async (id, data) => {
    setLoading(true);
    try {
      await clientesApi.actualizarCliente(id, data);
      await showSuccess('Actualizado', 'Datos modificados correctamente');
      fetchClientes();
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al actualizar';
      showError('Error', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCliente = async (id, nombre) => {
    // 1. Confirmación de usuario
    if (await confirm({ 
        title: '¿Eliminar Cliente?', 
        text: `Se eliminará a ${nombre}.`,
        isDanger: true 
    })) {
        try {
            // 2. Intentar borrar en API
            await clientesApi.eliminarCliente(id);
            
            // 3. Si éxito, actualizar UI
            setClientes(prev => prev.filter(c => c.id !== id));
            await showSuccess('Eliminado', 'Cliente eliminado correctamente.');
            return true;

        } catch (error) {
            // 4. SI FALLA (por reglas de negocio del backend)
            // Mostramos el mensaje exacto que programamos en views.py
            const msg = error.response?.data?.detail || 'No se pudo eliminar el cliente.';
            showError('No permitido', msg);
            return false;
        }
    }
  };

  return {
    clientes,
    loading,
    fetchClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
  };
};