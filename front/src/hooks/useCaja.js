import { useState, useCallback, useEffect } from 'react';
import { cajaApi } from '../api/cajaApi';
import { useSwal } from './useSwal';

export const useCaja = () => {
  const [caja, setCaja] = useState(null); 
  const [movimientos, setMovimientos] = useState([]);
  
  // NUEVO ESTADO
  const [historial, setHistorial] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, confirm } = useSwal();

  // ... (fetchEstadoCaja y fetchMovimientos se mantienen igual) ...
  const fetchEstadoCaja = useCallback(async () => {
      setLoading(true);
      try {
        const data = await cajaApi.getStatus();
        if (data && data.caja_estado) {
            setCaja(data);
            fetchMovimientos(data.id);
        } else {
            setCaja(null);
        }
      } catch (error) {
        console.error("Error status caja", error);
        setCaja(null);
      } finally {
        setLoading(false);
      }
  }, []);

  const fetchMovimientos = async (cajaId) => {
      try {
          const data = await cajaApi.getMovimientos(cajaId);
          setMovimientos(data);
      } catch (err) {
          console.error(err);
      }
  };

  // --- NUEVA FUNCIÓN: Cargar Historial ---
  const fetchHistorial = useCallback(async () => {
      setLoading(true);
      try {
          const data = await cajaApi.getHistorial();
          setHistorial(data.results || data);
      } catch (error) {
          console.error("Error historial", error);
          showError('Error', 'No se pudo cargar el historial.');
      } finally {
          setLoading(false);
      }
  }, [showError]);

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

  const registrarIngreso = async (descripcion, monto) => {
    try {
        await cajaApi.crearIngreso({
            ingreso_descripcion: descripcion,
            ingreso_monto: parseFloat(monto)
        });
        showSuccess('Ingreso Registrado');
        fetchEstadoCaja(); // Actualiza saldo y lista
        return true;
    } catch (error) {
        showError('Error', 'No se pudo registrar el ingreso.');
        return false;
    }
  };

  const registrarEgreso = async (descripcion, monto) => {
    try {
        await cajaApi.crearEgreso({
            egreso_descripcion: descripcion,
            egreso_monto: parseFloat(monto)
        });
        showSuccess('Egreso Registrado');
        fetchEstadoCaja(); 
        return true;
    } catch (error) {
        showError('Error', 'No se pudo registrar el egreso.');
        return false;
    }
  };

  useEffect(() => {
    fetchEstadoCaja();
  }, [fetchEstadoCaja]);

  return {
    caja,
    movimientos,
    historial, // Exportar estado
    loading,
    abrirCaja,
    cerrarCaja,
    registrarIngreso,
    registrarEgreso,
    refrescar: fetchEstadoCaja,
    fetchHistorial // Exportar función
  };
};