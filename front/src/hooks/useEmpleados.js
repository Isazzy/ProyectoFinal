// ========================================
// src/hooks/useEmpleados.js
// ========================================
import { useState, useCallback } from 'react';
import { empleadosApi } from '../api/empleadosApi';
import { useSwal } from './useSwal';

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Usamos 'confirm' que es el estándar que definimos en tus otros hooks
  const { showSuccess, showError, confirm } = useSwal();

  // Helper para extraer mensaje de error limpio del backend
  const getErrorMsg = (error) => {
      if (error.response && error.response.data) {
          const data = error.response.data;
          if (data.detail) return data.detail;
          
          // Si es un objeto de errores por campo (ej: { username: ["Ya existe"] })
          if (typeof data === 'object') {
              const firstKey = Object.keys(data)[0];
              const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
              return `${firstKey}: ${msg}`;
          }
      }
      return error.message || 'Ocurrió un error inesperado';
  };

  // --- CARGA DE DATOS ---
  const fetchEmpleados = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await empleadosApi.getEmpleados(params);
      setEmpleados(data.results || data);
    } catch (err) {
      console.error(err);
      // Opcional: No mostrar error bloqueante en la carga inicial
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await empleadosApi.getRoles();
      setRoles(data.results || data);
    } catch (err) {
      console.error("Error cargando roles", err);
    }
  }, []);

  // --- ACCIONES ---

  const crearEmpleado = async (data) => {
    setLoading(true);
    try {
      await empleadosApi.crearEmpleado(data);
      
      await showSuccess('¡Creado!', `El empleado ${data.first_name} ha sido registrado.`);
      
      // CRUCIAL: Recargar la lista desde el servidor para asegurar datos frescos
      await fetchEmpleados(); 
      
      return true; // Éxito
    } catch (err) {
      const msg = getErrorMsg(err);
      showError('Error al crear', msg);
      return false; // Fallo
    } finally {
      setLoading(false);
    }
  };

  const actualizarEmpleado = async (id, data) => {
    setLoading(true);
    try {
      await empleadosApi.actualizarEmpleado(id, data);
      
      await showSuccess('¡Actualizado!', 'Datos del empleado modificados correctamente.');
      
      // CRUCIAL: Recargar la lista
      await fetchEmpleados();
      
      return true;
    } catch (err) {
      const msg = getErrorMsg(err);
      showError('Error al actualizar', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpleado = async (id, nombreCompleto) => {
    // Usamos el confirm genérico con estilo peligro
    const isConfirmed = await confirm({
        title: '¿Eliminar Empleado?',
        text: `Se eliminará el acceso al sistema de ${nombreCompleto}.`,
        isDanger: true
    });
    
    if (!isConfirmed) return false;

    setLoading(true);
    try {
      await empleadosApi.eliminarEmpleado(id);
      
      // Para eliminar, podemos filtrar localmente (es seguro y rápido)
      setEmpleados(prev => prev.filter(e => e.id !== id));
      
      showSuccess('¡Eliminado!', 'El empleado ha sido eliminado.');
      return true;
    } catch (err) {
      const msg = getErrorMsg(err);
      showError('Error al eliminar', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    empleados,
    roles,
    loading,
    fetchEmpleados,
    fetchRoles,
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
  };
};