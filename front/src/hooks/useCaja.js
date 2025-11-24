import { useState, useCallback, useEffect } from 'react';
import { cajaApi } from '../api/cajaApi';
import { useSwal } from './useSwal';

export const useCaja = () => {
  const [caja, setCaja] = useState(null); // Objeto caja o null
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, confirm } = useSwal();

  // 1. Cargar Estado Inicial
  const fetchEstadoCaja = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cajaApi.getStatus();
      // Si el backend devuelve { caja_estado: false } o data vacía
      if (data && data.caja_estado) {
          setCaja(data);
          // Si está abierta, cargamos sus movimientos
          fetchMovimientos(data.id);
      } else {
          setCaja(null);
      }
    } catch (error) {
      console.error("No hay caja abierta o error:", error);
      setCaja(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Cargar Movimientos
  const fetchMovimientos = async (cajaId) => {
      try {
          const data = await cajaApi.getMovimientos(cajaId);
          setMovimientos(data);
      } catch (err) {
          console.error("Error cargando movimientos", err);
      }
  };

  // 3. Abrir Caja
  const abrirCaja = async (montoInicial) => {
    try {
        await cajaApi.abrirCaja(montoInicial);
        await showSuccess("Caja Abierta", `Iniciada con $${montoInicial}`);
        fetchEstadoCaja(); // Recargar estado
        return true;
    } catch (error) {
        showError("Error", error.response?.data?.detail || "No se pudo abrir la caja");
        return false;
    }
  };

  // 4. Cerrar Caja (Arqueo)
  const cerrarCaja = async (observacion) => {
    if (!caja) return;
    
    if (await confirm({ 
        title: '¿Cerrar Caja?', 
        text: 'Se realizará el arqueo final y no podrás registrar más ventas en este turno.',
        icon: 'warning'
    })) {
        try {
            await cajaApi.cerrarCaja(caja.id, observacion);
            await showSuccess("Caja Cerrada", "El turno ha finalizado correctamente.");
            setCaja(null);
            setMovimientos([]);
            return true;
        } catch (error) {
            showError("Error", "No se pudo cerrar la caja");
            return false;
        }
    }
  };

  useEffect(() => {
    fetchEstadoCaja();
  }, [fetchEstadoCaja]);

  return {
    caja,
    movimientos,
    loading,
    abrirCaja,
    cerrarCaja,
    refrescar: fetchEstadoCaja
  };
};