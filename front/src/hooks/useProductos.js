import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSwal();

  const fetchProductos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await inventarioApi.getProductos(params);
      setProductos(data.results || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []); 

  const fetchDependencias = useCallback(async () => {
    try {
      const [tiposData, marcasData] = await Promise.all([
        inventarioApi.getTiposProducto(),
        inventarioApi.getMarcas(),
      ]);
      setTipos(tiposData.results || tiposData);
      setMarcas(marcasData.results || marcasData);
    } catch (error) {
      console.error("Error cargando dependencias", error);
    }
  }, []);

  const crearProducto = async (formData) => {
    setLoading(true);
    try {
      await inventarioApi.crearProducto(formData);
      showSuccess('Creado', 'Producto creado exitosamente');
      fetchProductos();
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'No se pudo crear';
      showError('Error', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarProducto = async (id, formData) => {
    setLoading(true);
    try {
      await inventarioApi.actualizarProducto(id, formData);
      showSuccess('Actualizado', 'Producto actualizado exitosamente');
      fetchProductos();
      return true;
    } catch (error) {
      const msg = error.response?.data?.detail || 'No se pudo actualizar';
      showError('Error', msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoProducto = async (id, nuevoEstado) => {
    try {
        await inventarioApi.patchProducto(id, { activo: nuevoEstado });
        setProductos(prev => prev.map(p => 
            p.id === id ? { ...p, activo: nuevoEstado } : p
        ));
        showSuccess('Listo', nuevoEstado ? 'Producto reactivado' : 'Producto desactivado');
        return true;
    } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo cambiar el estado');
        return false;
    }
  };

  const eliminarProducto = async (id) => {
    try {
        await inventarioApi.eliminarProducto(id);
        setProductos(prev => prev.filter(p => p.id !== id));
        showSuccess('Eliminado', 'Producto eliminado.');
    } catch (error) {
        const msg = error.response?.data?.detail || 'No se pudo eliminar.';
        showError('Error', msg);
    }
  };

  // --- CREACIÓN RÁPIDA DE DEPENDENCIAS ---
  const crearTipoRapido = async (nombre) => {
      try {
          // El backend espera 'tipo_producto_nombre'
          await inventarioApi.crearTipoProducto({ tipo_producto_nombre: nombre }); 
          await fetchDependencias(); // Recargar listas
          return true;
      } catch (e) {
          showError("Error", "No se pudo crear el tipo de producto");
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
    productos,
    tipos,
    marcas,
    loading,
    fetchProductos,
    fetchDependencias,
    crearProducto,
    actualizarProducto,
    toggleEstadoProducto,
    eliminarProducto,
    crearTipoRapido,   // <--- Nuevo export
    crearMarcaRapida   // <--- Nuevo export
  };
};