import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useInventario = () => {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, confirm } = useSwal();

  // Helper para extraer mensaje de error
  const getErrorMsg = (error, defaultMsg) => {
      if (error.response && error.response.data) {
          const data = error.response.data;
          if (typeof data === 'string') return data;
          if (Array.isArray(data)) return data[0];
          if (typeof data === 'object') {
              // Devuelve el primer error que encuentre (ej: "nombre: Este campo es requerido")
              const key = Object.keys(data)[0];
              const msg = Array.isArray(data[key]) ? data[key][0] : data[key];
              return `${key}: ${msg}`;
          }
      }
      return error.message || defaultMsg;
  };

  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventarioApi.getInsumos();
      setInsumos(data.results || data);
    } catch (error) {
      console.error(error);
      // showError('Error', 'No se pudieron cargar los insumos'); // Opcional silenciar en carga inicial
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDependencias = useCallback(async () => {
    try {
      const [catsData, marcasData] = await Promise.all([
        inventarioApi.getCategorias(),
        inventarioApi.getMarcas()
      ]);
      setCategorias(catsData.results || catsData);
      setMarcas(marcasData.results || marcasData);
    } catch (error) {
      console.error("Error cargando dependencias", error);
    }
  }, []);

  const crearInsumo = async (formData) => {
    setLoading(true);
    try {
      await inventarioApi.crearInsumo(formData);
      showSuccess('Creado', 'Insumo agregado correctamente');
      fetchInsumos(); 
      return true;
    } catch (error) {
      const msg = getErrorMsg(error, 'No se pudo crear el insumo');
      showError('Error al crear', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarInsumo = async (id, formData) => {
    setLoading(true);
    try {
      await inventarioApi.actualizarInsumo(id, formData);
      showSuccess('Actualizado', 'Insumo editado correctamente');
      fetchInsumos();
      return true;
    } catch (error) {
      const msg = getErrorMsg(error, 'No se pudo actualizar el insumo');
      showError('Error al actualizar', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoInsumo = async (id, nuevoEstado) => {
    try {
        await inventarioApi.patchInsumo(id, { activo: nuevoEstado }); 
        setInsumos(prev => prev.map(i => 
            i.id === id ? { ...i, activo: nuevoEstado } : i
        ));
        showSuccess('Listo', nuevoEstado ? 'Insumo reactivado' : 'Insumo desactivado');
        return true;
    } catch (error) {
        const msg = getErrorMsg(error, 'No se pudo cambiar el estado');
        showError('Error', msg);
        return false;
    }
  };

  const eliminarInsumo = async (id) => {
    try {
        await inventarioApi.eliminarInsumo(id);
        setInsumos(prev => prev.filter(i => i.id !== id));
        showSuccess('Eliminado', 'Insumo eliminado.');
    } catch (error) {
        const msg = getErrorMsg(error, 'No se pudo eliminar');
        showError('Error', msg);
    }
  };

  return {
    insumos,
    categorias,
    marcas,
    loading,
    fetchInsumos,
    fetchDependencias,
    crearInsumo,
    actualizarInsumo,
    toggleEstadoInsumo, 
    eliminarInsumo
  };
};