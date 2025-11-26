import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useDependencias = () => {
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]); // Nuevo estado
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, confirm } = useSwal();

  // --- CARGA ---
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Cargamos los 3 catálogos en paralelo
      const [t, m, c] = await Promise.all([
        inventarioApi.getTiposProducto(),
        inventarioApi.getMarcas(),
        inventarioApi.getCategorias()
      ]);
      setTipos(t.results || t);
      setMarcas(m.results || m);
      setCategorias(c.results || c);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo cargar la configuración.');
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
      showError('Error', 'No se pudo eliminar. Verifique si está en uso.');
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
      showError('Error', 'No se pudo eliminar. Verifique si está en uso.');
    }
  };

  // --- CATEGORÍAS (NUEVO) ---
  const guardarCategoria = async (data, id = null) => {
    try {
      if (id) await inventarioApi.actualizarCategoria(id, data);
      else await inventarioApi.crearCategoria(data);
      showSuccess('Éxito', 'Categoría guardada');
      fetchAll();
      return true;
    } catch (error) {
      showError('Error', 'No se pudo guardar la categoría');
      return false;
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      await inventarioApi.eliminarCategoria(id);
      setCategorias(prev => prev.filter(item => item.id !== id));
      showSuccess('Eliminado', 'Categoría eliminada');
    } catch (error) {
      showError('Error', 'No se pudo eliminar. Verifique si está en uso.');
    }
  };

  return {
    tipos,
    marcas,
    categorias, // Exportado
    loading,
    fetchAll,
    guardarTipo,
    eliminarTipo,
    guardarMarca,
    eliminarMarca,
    guardarCategoria, // Exportado
    eliminarCategoria // Exportado
  };
};