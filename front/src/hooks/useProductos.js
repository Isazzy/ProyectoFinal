import { useState, useCallback } from 'react';
import { inventarioApi } from '../api/inventarioApi';
import { useSwal } from './useSwal';

export const useProductos = () => {
  const [productos, setProductos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useSwal();

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventarioApi.getProductos();
      setProductos(data.results || data);
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [showError]); 

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

  // --- NUEVA FUNCIÓN PARA CAMBIAR ESTADO ---
  const toggleEstadoProducto = async (id, nuevoEstado) => {
    try {
        // Usamos PATCH para no tener que enviar todo el objeto
        await inventarioApi.patchProducto(id, { activo: nuevoEstado });
        
        // Actualizamos estado local para reflejar cambio inmediato en la UI
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

  return {
    productos,
    tipos,
    marcas,
    loading,
    fetchProductos,
    fetchDependencias,
    crearProducto,
    actualizarProducto,
    toggleEstadoProducto, // <--- EXPORTAR ESTA NUEVA FUNCIÓN
    eliminarProducto
  };
};