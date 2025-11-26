import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useInventario = () => {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, confirm } = useSwal();

  // Helper para errores
  const getErrorMsg = (error) => {
      if (error.response?.data?.detail) return error.response.data.detail;
      return error.message || 'Error desconocido';
  };

  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventarioApi.getInsumos();
      setInsumos(data.results || data);
    } catch (error) {
      console.error(error);
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
      showError('Error', getErrorMsg(error));
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
      showError('Error', getErrorMsg(error));
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
        showError('Error', getErrorMsg(error));
        return false;
    }
  };

  const eliminarInsumo = async (id) => {
    // Intenta borrar físicamente
    try {
        await inventarioApi.eliminarInsumo(id);
        setInsumos(prev => prev.filter(i => i.id !== id));
        showSuccess('Eliminado', 'Registro borrado permanentemente.');
        return true;
    } catch (error) {
        // Si falla (ej: IntegrityError), sugerimos desactivar
        showError('No se pudo borrar', 'El insumo tiene registros vinculados. Desactívelo en su lugar.');
        return false;
    }
  };

  // --- CREACIÓN RÁPIDA DE DEPENDENCIAS ---
  const crearCategoriaRapida = async (nombre) => {
      try {
          // Asumimos que existe inventarioApi.crearCategoria o usamos POST directo
          // Si no existe en tu API, agrégalo similar a crearMarca
          await inventarioApi.crearCategoria({ categoria_insumo_nombre: nombre }); 
          await fetchDependencias(); // Recargar listas
          return true;
      } catch (e) {
          showError("Error", "No se pudo crear la categoría");
          return false;
      }
  };

  const crearMarcaRapida = async (nombre) => {
      try {
          await inventarioApi.crearMarca({ nombre: nombre });
          await fetchDependencias();
          return true;
      } catch (e) {
          showError("Error", "No se pudo crear la marca");
          return false;
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
    eliminarInsumo,
    crearCategoriaRapida,
    crearMarcaRapida
  };
};