 import { useState, useCallback } from 'react';
import { serviciosApi } from '../api/serviciosApi';
import { useSwal } from './useSwal';

export const useServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useSwal();

  const fetchServicios = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await serviciosApi.getServicios(params);
      setServicios(data.results || data);
      return data;
    } catch (err) {
      setError(err.message);
      showError('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const crearServicio = async (data) => {
    setLoading(true);
    try {
      const nuevo = await serviciosApi.crearServicio(data);
      // Actualización optimista local
      setServicios(prev => [...prev, nuevo]);
      showSuccess('¡Servicio creado!', `${data.nombre} fue agregado exitosamente`);
      return true; // RETORNO DE ÉXITO (Importante para la vista)
    } catch (err) {
      showError('Error', err.response?.data?.detail || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarServicio = async (id_serv, data) => {
    setLoading(true);
    try {
      const actualizado = await serviciosApi.actualizarServicio(id_serv, data);
      setServicios(prev => prev.map(s => s.id_serv === id_serv ? actualizado : s));
      showSuccess('¡Servicio actualizado!');
      return true; // RETORNO DE ÉXITO
    } catch (err) {
      showError('Error', err.response?.data?.detail || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE BORRADO INTELIGENTE ---
  const eliminarServicio = async (id_serv) => {
    setLoading(true);
    try {
      const response = await serviciosApi.eliminarServicio(id_serv);
      // Manejo robusto: Axios puede devolver data directa o el objeto response
      const data = response.data !== undefined ? response.data : response;

      if (data && data.action === 'soft_delete') {
          // Soft Delete: Backend devolvió 200 OK con mensaje
          setServicios(prev => prev.map(s => 
              s.id_serv === id_serv ? { ...s, activo: false } : s
          ));
          showSuccess('Atención', data.message);
      } else {
          // Hard Delete: Backend devolvió 204 No Content
          setServicios(prev => prev.filter(s => s.id_serv !== id_serv));
          showSuccess('Eliminado', 'El servicio fue eliminado permanentemente.');
      }
      return true; // RETORNO DE ÉXITO
    } catch (err) {
      showError('Error', err.response?.data?.detail || "No se pudo eliminar el servicio");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE REACTIVACIÓN ---
  const reactivarServicio = async (id_serv) => {
      try {
          await serviciosApi.patchServicio(id_serv, { activo: true });
          // Actualización optimista
          setServicios(prev => prev.map(s => 
              s.id_serv === id_serv ? { ...s, activo: true } : s
          ));
          showSuccess('Listo', 'Servicio reactivado correctamente');
          return true; // RETORNO DE ÉXITO
      } catch (err) {
          showError('Error', err.response?.data?.detail || "No se pudo reactivar");
          return false;
      }
  };

  return {
    servicios,
    loading,
    error,
    fetchServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    reactivarServicio,
    setServicios,
  };
};