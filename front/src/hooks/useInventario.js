import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useInventario = () => {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showInfo } = useSwal(); // Asegúrate de tener showInfo disponible

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

  // --- LÓGICA DE ELIMINACIÓN CONDICIONAL ---
  const eliminarInsumo = async (id) => {
    setLoading(true);
    try {
        // La API ahora devuelve 'response' completo
        const response = await inventarioApi.eliminarInsumo(id);
        
        const data = response.data;
        const status = response.status;

        // CASO 1: Soft Delete (Backend devuelve 200 y action: 'soft_delete')
        if (status === 200 && data?.action === 'soft_delete') {
            setInsumos(prev => prev.map(i => 
                i.id === id ? { ...i, activo: false } : i
            ));
            // Mensaje informativo distinto al de éxito normal
            showSuccess('Atención', data.message || 'El insumo tiene registros asociados, se ha desactivado.');
        } 
        // CASO 2: Hard Delete (Backend devuelve 204 No Content)
        else {
            setInsumos(prev => prev.filter(i => i.id !== id));
            showSuccess('Eliminado', 'Insumo eliminado permanentemente.');
        }
        return true;

    } catch (error) {
        console.error("Error eliminando:", error);
        showError('Error', getErrorMsg(error));
        return false;
    } finally {
        setLoading(false);
    }
  };

  // --- CREACIÓN RÁPIDA DE DEPENDENCIAS ---
  const crearCategoriaRapida = async (nombre) => {
      try {
          await inventarioApi.crearCategoria({ categoria_insumo_nombre: nombre }); 
          await fetchDependencias(); 
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