import { useState, useCallback } from 'react';
import { empleadosApi } from '../api/empleadosApi';
import { useSwal } from './useSwal';

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]); // Nuevo estado para roles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError, confirmDelete } = useSwal();

  const fetchEmpleados = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await empleadosApi.getEmpleados(params);
      setEmpleados(data.results || data);
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Nuevo: Obtener roles para el formulario
  const fetchRoles = useCallback(async () => {
    try {
      const data = await empleadosApi.getRoles();
      setRoles(data.results || data); // Ajusta según tu respuesta de API
    } catch (err) {
      console.error("Error cargando roles", err);
    }
  }, []);

  const crearEmpleado = useCallback(async (data) => {
    setLoading(true);
    try {
      const nuevo = await empleadosApi.crearEmpleado(data);
      setEmpleados(prev => [...prev, nuevo]);
      showSuccess('¡Creado!', `El empleado ${data.first_name} fue creado.`);
      return nuevo;
    } catch (err) {
      // Muestra errores del backend (ej: "username ya existe")
      const msg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      showError('Error al crear', msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const actualizarEmpleado = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const actualizado = await empleadosApi.actualizarEmpleado(id, data);
      setEmpleados(prev => prev.map(e => e.id === id ? actualizado : e));
      showSuccess('¡Actualizado!', 'Datos del empleado actualizados.');
      return actualizado;
    } catch (err) {
      showError('Error al actualizar', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const eliminarEmpleado = useCallback(async (id, nombreCompleto) => {
    const confirmed = await confirmDelete(nombreCompleto);
    if (!confirmed) return false;

    setLoading(true);
    try {
      await empleadosApi.eliminarEmpleado(id);
      setEmpleados(prev => prev.filter(e => e.id !== id));
      showSuccess('¡Eliminado!', 'El empleado ha sido eliminado.');
      return true;
    } catch (err) {
      showError('Error', err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [confirmDelete, showSuccess, showError]);

  return {
    empleados,
    roles,
    loading,
    error,
    fetchEmpleados,
    fetchRoles,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
  };
};