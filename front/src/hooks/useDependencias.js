import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useDependencias = () => {
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSwal();

  // --- CARGA ---
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [t, m] = await Promise.all([
        inventarioApi.getTiposProducto(),
        inventarioApi.getMarcas()
      ]);
      setTipos(t.results || t);
      setMarcas(m.results || m);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudieron cargar los catálogos');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- TIPOS ---
  const guardarTipo = async (data, id = null) => {
    try {
      if (id) await inventarioApi.actualizarTipoProducto(id, data);
      else await inventarioApi.crearTipoProducto(data);
      showSuccess('Éxito', 'Tipo de producto guardado');
      fetchAll();
      return true;
    } catch (error) {
      showError('Error', 'No se pudo guardar el tipo');
      return false;
    }
  };

  const eliminarTipo = async (id) => {
    try {
      await inventarioApi.eliminarTipoProducto(id);
      setTipos(prev => prev.filter(item => item.id !== id));
      showSuccess('Eliminado', 'Tipo eliminado');
    } catch (error) {
      showError('Error', 'No se pudo eliminar');
    }
  };

  // --- MARCAS ---
  const guardarMarca = async (data, id = null) => {
    try {
      if (id) await inventarioApi.actualizarMarca(id, data);
      else await inventarioApi.crearMarca(data);
      showSuccess('Éxito', 'Marca guardada');
      fetchAll();
      return true;
    } catch (error) {
      showError('Error', 'No se pudo guardar la marca');
      return false;
    }
  };

  const eliminarMarca = async (id) => {
    try {
      await inventarioApi.eliminarMarca(id);
      setMarcas(prev => prev.filter(item => item.id !== id));
      showSuccess('Eliminado', 'Marca eliminada');
    } catch (error) {
      showError('Error', 'No se pudo eliminar');
    }
  };

  return {
    tipos,
    marcas,
    loading,
    fetchAll,
    guardarTipo,
    eliminarTipo,
    guardarMarca,
    eliminarMarca
  };
};