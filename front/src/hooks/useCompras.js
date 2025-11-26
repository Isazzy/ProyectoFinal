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
        
        // Caso 1: Error simple { detail: "..." }
        if (data.detail) return data.detail;
        
        // Caso 2: Lista de errores ["Error 1"]
        if (Array.isArray(data)) return data[0];
        
        // Caso 3: Objeto de errores de campo { proveedor: ["Requerido"], non_field_errors: ["..."] }
        if (typeof data === 'object') {
            const keys = Object.keys(data);
            if (keys.length > 0) {
                const firstKey = keys[0];
                const firstError = data[firstKey];
                const errorTxt = Array.isArray(firstError) ? firstError[0] : firstError;
                // Si es un error general (non_field_errors), solo mostramos el texto
                return firstKey === 'non_field_errors' ? errorTxt : `${firstKey}: ${errorTxt}`;
            }
        }
        
        return 'Error desconocido al procesar la solicitud.';
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
            showSuccess('Éxito', 'Proveedor guardado');
            fetchProveedores();
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
            
            // Cargar Insumos y Productos para la orden de compra
            const [insumosData, productosData] = await Promise.all([
                inventarioApi.getInsumosParaSelect(),
                inventarioApi.getProductos()
            ]);
            
            // Unificamos para tener disponible en el estado si se necesita
            // (Aunque el formulario hace su propia carga, es bueno tenerlo aquí)
            const insumos = insumosData.results || insumosData || [];
            const productos = productosData.results || productosData || [];
            setInsumosDisponibles([...insumos, ...productos]);

        } catch (error) {
            console.error(error);
            // Opcional: showError('Error', 'No se pudieron cargar las compras');
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
        if (await confirm({title: 'Eliminar Proveedor', text: 'Esto no se puede revertir.'})) {
            try {
                await comprasApi.eliminarProveedor(id);
                fetchProveedores();
                showSuccess('Eliminado', 'Proveedor removido.');
            } catch (error) {
                showError('Error', getErrorMsg(error));
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