import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useInventario = () => {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSwal();

  // Cargar lista principal
  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventarioApi.getInsumos();
      setInsumos(data.results || data);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudieron cargar los insumos');
    } finally {
      setLoading(false);
    }
  }, [showError]);

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
      console.error(error);
      showError('Error', 'No se pudo crear el insumo');
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
      console.error(error);
      showError('Error', 'No se pudo actualizar el insumo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --- CORRECCIÓN AQUÍ ---
  const toggleEstadoInsumo = async (id, nuevoEstado) => {
    try {
        // USAR patchInsumo EN LUGAR DE actualizarInsumo
        // Esto envía una petición PATCH que permite campos parciales
        await inventarioApi.patchInsumo(id, { activo: nuevoEstado }); 
        
        // Actualización optimista del estado local
        setInsumos(prev => prev.map(i => 
            i.id === id ? { ...i, activo: nuevoEstado } : i
        ));
        
        showSuccess('Listo', nuevoEstado ? 'Insumo reactivado' : 'Insumo desactivado');
        return true;
    } catch (error) {
        console.error(error);
        // Si falla, revertimos o mostramos error. 
        // Es útil ver qué dice el backend
        const msg = error.response?.data?.detail || 'No se pudo cambiar el estado';
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
        showError('Error', 'No se pudo eliminar.');
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