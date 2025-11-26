// ========================================
// src/hooks/useCompras.js
// ========================================
import { useState, useCallback } from 'react';
import { comprasApi } from '../api/comprasApi';
import { inventarioApi } from '../api/inventarioApi'; 
import { useSwal } from './useSwal';

export const useCompras = () => {
    const [compras, setCompras] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [insumosDisponibles, setInsumosDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError, confirm } = useSwal();

    // Helper para extraer mensajes de error de Django (DRF)
    const getErrorMsg = (error) => {
        if (!error.response || !error.response.data) {
            return error.message || 'Error de conexión';
        }
        const data = error.response.data;
        
        // Caso 1: Error simple { detail: "..." } (Usado para ProtectedError)
        if (data.detail) return data.detail;
        
        // Caso 2: Lista de errores ["Error 1"]
        if (Array.isArray(data)) return data[0];
        
        // Caso 3: Objeto de errores de campo
        if (typeof data === 'object') {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                const firstKey = keys[0];
                const firstError = data[firstKey];
                const errorTxt = Array.isArray(firstError) ? firstError[0] : firstError;
                return firstKey === 'non_field_errors' ? errorTxt : `${firstKey}: ${errorTxt}`;
            }
        }
        
        return 'Error: No se puede borrar este proveedor.';
    };

    // --- CRUD PROVEEDORES ---
    const fetchProveedores = useCallback(async () => {
        try {
            const data = await comprasApi.getProveedores();
            setProveedores(data.results || data);
        } catch (error) {
            console.error("Error cargando proveedores:", error);
        }
    }, []);

    const guardarProveedor = async (data, id = null) => {
        try {
            if (id) await comprasApi.actualizarProveedor(id, data);
            else await comprasApi.crearProveedor(data);
            
            showSuccess('Éxito', 'Proveedor guardado correctamente');
            
            // ACTUALIZACIÓN REACTIVA:
            // 1. Recargamos la lista de proveedores
            await fetchProveedores();
            
            // 2. IMPORTANTE: Recargamos el historial de compras.
            // Si editaste el nombre de un proveedor, esto actualiza la tabla de compras automáticamente.
            fetchCompras(); 
            
            return true;
        } catch (error) {
            const msg = getErrorMsg(error);
            showError('Error', msg);
            return false;
        }
    };

    // --- GESTIÓN DE COMPRAS ---
    const fetchCompras = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await comprasApi.getCompras(params);
            setCompras(data.results || data);
            
            // Cargar catálogos para la orden de compra (si no se han cargado)
            // Esto permite que el selector funcione rápido al abrir el modal
            const [insumosData, productosData] = await Promise.all([
                inventarioApi.getInsumosParaSelect(),
                inventarioApi.getProductos()
            ]);
            
            const insumos = insumosData.results || insumosData || [];
            const productos = productosData.results || productosData || [];
            
            // Combinamos para tener disponible en el estado global del hook
            setInsumosDisponibles([...insumos, ...productos]);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const crearCompra = async (payload) => {
        setLoading(true);
        try {
            await comprasApi.crearCompra(payload);
            showSuccess('Compra Registrada', 'El stock ha sido actualizado.');
            fetchCompras(); 
            return true;
        } catch (error) {
            console.error("Error creando compra:", error.response?.data);
            const msg = getErrorMsg(error);
            showError('Error al registrar compra', msg);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    const eliminarProveedor = async (id) => {
        // Confirmación de seguridad
        if (await confirm({
            title: '¿Eliminar Proveedor?', 
            text: 'Esta acción es irreversible. Si el proveedor tiene compras asociadas, no se podrá eliminar.',
            isDanger: true
        })) {
            try {
                await comprasApi.eliminarProveedor(id);
                
                // Actualización optimista
                setProveedores(prev => prev.filter(p => p.id !== id));
                showSuccess('Eliminado', 'Proveedor removido.');
                return true;

            } catch (error) {
                // Aquí se muestra el mensaje del backend ("No se puede eliminar... tiene compras")
                const msg = getErrorMsg(error);
                showError('No se pudo eliminar', msg);
                return false;
            }
        }
    };

    return {
        compras,
        proveedores,
        insumosDisponibles,
        loading,
        fetchCompras,
        fetchProveedores,
        crearCompra,
        guardarProveedor,
        eliminarProveedor
    };
};