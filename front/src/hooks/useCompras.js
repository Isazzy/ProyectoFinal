// ========================================
// src/hooks/useCompras.js (CORREGIDO)
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
        // ... (Lógica de guardar proveedor se mantiene igual) ...
        try {
            if (id) await comprasApi.actualizarProveedor(id, data);
            else await comprasApi.crearProveedor(data);
            showSuccess('Éxito', 'Proveedor guardado');
            fetchProveedores();
            return true;
        } catch (error) {
            showError('Error', 'No se pudo guardar el proveedor');
            return false;
        }
    };

    // --- CARGA DE CATÁLOGOS (INSUMOS) ---
    // Nueva función para cargar solo insumos, usada en el formulario
    const fetchInsumosDisponibles = useCallback(async () => {
        try {
            const insumos = await inventarioApi.getInsumosParaSelect(); 
            setInsumosDisponibles(insumos.results || insumos);
        } catch (error) {
             showError('Error', 'No se pudieron cargar los insumos de inventario.');
        }
    }, [showError]);

    // --- GESTIÓN DE COMPRAS (LISTA PRINCIPAL) ---
    const fetchCompras = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await comprasApi.getCompras(params);
            setCompras(data.results || data);
        } catch (error) {
            showError('Error', 'No se pudieron cargar las compras');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const crearCompra = async (payload) => {
        setLoading(true);
        try {
            await comprasApi.crearCompra(payload);
            showSuccess('Compra Registrada', 'El stock de insumos ha sido actualizado.');
            fetchCompras(); // Solo refrescamos la lista de compras
            return true;
        } catch (error) {
            const msg = error.response?.data?.detail || 'Verifique caja y detalles de insumos.';
            showError('Error', msg);
            return false;
        } finally {
            setLoading(false);
        }
    };
    
    const eliminarProveedor = async (id) => {
        // ... (Lógica de eliminar proveedor se mantiene igual) ...
        if (await confirm({title: 'Eliminar Proveedor', text: 'Esto no se puede revertir.'})) {
            try {
                await comprasApi.eliminarProveedor(id);
                fetchProveedores();
                showSuccess('Eliminado', 'Proveedor removido.');
            } catch (error) {
                showError('Error', 'No se pudo eliminar.');
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
        fetchInsumosDisponibles, // Nueva función exportada
        crearCompra,
        guardarProveedor,
        eliminarProveedor
    };
};