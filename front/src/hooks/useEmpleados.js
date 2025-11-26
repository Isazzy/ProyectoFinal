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
  
  // Usamos 'confirm' estándar del hook
  const { showSuccess, showError, confirm } = useSwal();

  // --- HELPER DE ERRORES ---
  // Parsea la respuesta de error de Django para mostrar mensajes claros
  const getErrorMsg = (error) => {
      // CORRECCIÓN: Interceptar error 500 explícitamente
      if (error.response && error.response.status === 500) {
          return "No se puede borrar usuarios con registros vinculados.";
      }

      if (error.response && error.response.data) {
          const data = error.response.data;
          
          // Caso 1: Error general simple
          if (data.detail) return data.detail;
          
          // Caso 2: Lista de errores
          if (Array.isArray(data)) return data[0];
          
          // Caso 3: Errores de validación por campo (ej: { username: ["Ya existe"] })
          if (typeof data === 'object') {
              const keys = Object.keys(data);
              if (keys.length > 0) {
                  const firstKey = keys[0];
                  const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
                  return firstKey === 'non_field_errors' ? msg : `${firstKey}: ${msg}`;
              }
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
      // No mostramos error bloqueante en la carga inicial para no interrumpir la UI
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
      await showSuccess('Creado', `El empleado ${data.first_name} ha sido registrado.`);
      
      // CRUCIAL: Recargar la lista desde el servidor para tener datos frescos (IDs, fechas, etc.)
      await fetchEmpleados(); 
      
      return true; // Retorna éxito para cerrar el modal
    } catch (err) {
      const msg = getErrorMsg(err);
      showError('Error al crear', msg);
      return false; // Retorna fallo para mantener el modal abierto
    } finally {
      setLoading(false);
    }
  };

  const actualizarEmpleado = async (id, data) => {
    setLoading(true);
    try {
      await empleadosApi.actualizarEmpleado(id, data);
      await showSuccess('Actualizado', 'Datos del empleado modificados correctamente.');
      
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
    const isConfirmed = await confirm({
        title: '¿Eliminar Empleado?',
        text: `Se eliminará el acceso de ${nombreCompleto}.`,
        isDanger: true,
        confirmText: 'Sí, eliminar'
    });
    
    if (!isConfirmed) return false;

    setLoading(true);
    try {
      await empleadosApi.eliminarEmpleado(id);
      
      // Actualización optimista: filtramos localmente porque borrar es destructivo y simple
      setEmpleados(prev => prev.filter(e => e.id !== id));
      
      showSuccess('Eliminado', 'El empleado ha sido eliminado.');
      return true;
    } catch (err) {
      // Aquí capturamos el error 400/500 del backend (Integridad Referencial)
      const msg = getErrorMsg(err);
      showError('Error', msg);
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