import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useDependencias = () => {
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [categorias, setCategorias] = useState([]); 
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSwal(); 

  // --- CARGA ---
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
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

  // ==========================
  //  1. TIPOS DE PRODUCTO
  // ==========================
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
      const response = await inventarioApi.eliminarTipoProducto(id);
      const data = response.data !== undefined ? response.data : response;

      if (data && data.action === 'soft_delete') {
          // Si entró al catch del backend, se desactivó
          setTipos(prev => prev.map(item => item.id === id ? { ...item, activo: false } : item));
          showSuccess('Atención', data.message);
      } else {
          // Si fue 204, se borró físicamente
          setTipos(prev => prev.filter(item => item.id !== id));
          showSuccess('Eliminado', 'Tipo eliminado permanentemente');
      }
    } catch (error) {
      showError('Error', 'No se pudo eliminar el tipo.');
    }
  };

  const reactivarTipo = async (id) => {
    try {
        await inventarioApi.patchTipoProducto(id, { activo: true });
        setTipos(prev => prev.map(item => item.id === id ? { ...item, activo: true } : item));
        showSuccess('Listo', 'Tipo reactivado');
    } catch (e) {
        showError('Error', 'No se pudo reactivar');
    }
  };

  // ==========================
  //  2. MARCAS
  // ==========================
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
      const response = await inventarioApi.eliminarMarca(id);
      const data = response.data !== undefined ? response.data : response;

      if (data && data.action === 'soft_delete') {
          setMarcas(prev => prev.map(item => item.id === id ? { ...item, activo: false } : item));
          showSuccess('Atención', data.message);
      } else {
          setMarcas(prev => prev.filter(item => item.id !== id));
          showSuccess('Eliminado', 'Marca eliminada permanentemente');
      }
    } catch (error) {
      showError('Error', 'No se pudo eliminar la marca.');
    }
  };

  const reactivarMarca = async (id) => {
    try {
        await inventarioApi.patchMarca(id, { activo: true });
        setMarcas(prev => prev.map(item => item.id === id ? { ...item, activo: true } : item));
        showSuccess('Listo', 'Marca reactivada');
    } catch (e) {
        showError('Error', 'No se pudo reactivar');
    }
  };

  // ==========================
  //  3. CATEGORÍAS
  // ==========================
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
      const response = await inventarioApi.eliminarCategoria(id);
      const data = response.data !== undefined ? response.data : response;

      if (data && data.action === 'soft_delete') {
          setCategorias(prev => prev.map(item => item.id === id ? { ...item, activo: false } : item));
          showSuccess('Atención', data.message);
      } else {
          setCategorias(prev => prev.filter(item => item.id !== id));
          showSuccess('Eliminado', 'Categoría eliminada permanentemente');
      }
    } catch (error) {
      showError('Error', 'No se pudo eliminar la categoría.');
    }
  };

  const reactivarCategoria = async (id) => {
    try {
        await inventarioApi.patchCategoria(id, { activo: true });
        setCategorias(prev => prev.map(item => item.id === id ? { ...item, activo: true } : item));
        showSuccess('Listo', 'Categoría reactivada');
    } catch (e) {
        showError('Error', 'No se pudo reactivar');
    }
  };

  return {
    tipos,
    marcas,
    categorias,
    loading,
    fetchAll,
    // Tipos
    guardarTipo, eliminarTipo, reactivarTipo,
    // Marcas
    guardarMarca, eliminarMarca, reactivarMarca,
    // Categorías
    guardarCategoria, eliminarCategoria, reactivarCategoria
  };
};