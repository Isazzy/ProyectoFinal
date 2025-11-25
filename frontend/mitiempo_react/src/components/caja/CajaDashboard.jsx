//  src/components/caja/CajaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';  // Librería de alertas
import {
  getCajas,
  getCajasAbiertas,
  abrirCaja,
  cerrarCaja,
  createCaja,
  updateCaja,
  deleteCaja
} from '../../api/caja';  //Importa las funciones de caja.js

import AbrirCajaModal from './AbrirCajaModal';
import CerrarCajaModal from './CerrarCajaModal';


function CajaDashboard() {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);  // Toggle para ver todas o solo abiertas
  

// AGREGADO: Estados para controlar los modales
  const [modalAbrirOpen, setModalAbrirOpen] = useState(false);
  const [modalCerrarOpen, setModalCerrarOpen] = useState(false);

  // Cargar cajas al montar el componente
  useEffect(() => {
    cargarCajas();
  }, [mostrarTodas]);

  const cargarCajas = async () => {
    setLoading(true);
    try {
      const data = mostrarTodas ? await getCajas() : await getCajasAbiertas();
      // AGREGADO: Asegura que sea array (maneja paginación de DRF)
      setCajas(Array.isArray(data) ? data : data.results || []);  // Asegura que sea array
      toast.success('Cajas cargadas correctamente');  // Alerta de éxito
    } catch (error) {
      toast.error('Error al cargar cajas: ' + (error.response?.data?.error || error.message));  // Alerta de error
    } finally {
      setLoading(false);
    }
  };

 

  // Función para eliminar caja (opcional, con confirmación)
  const handleEliminarCaja = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta caja?')) {
      try {
        await deleteCaja(id);
        toast.success('Caja eliminada correctamente');
        cargarCajas();
      } catch (error) {
        toast.error('Error al eliminar caja: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard de Cajas</h1>

      {/* Toggle para ver todas o solo abiertas */}
      <button onClick={() => setMostrarTodas(!mostrarTodas)}>
        {mostrarTodas ? 'Ver solo abiertas' : 'Ver todas las cajas'}
      </button>


      {/* AGREGADO: Botones para abrir los modales (reemplazan los formularios inline) */}
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => setModalAbrirOpen(true)} style={{ marginRight: '10px' }}>
          Abrir Caja
        </button>
        <button onClick={() => setModalCerrarOpen(true)}>
          Cerrar Caja
        </button>
      </div>

    {/* AGREGADO: Componentes de modales */}
      <AbrirCajaModal
        isOpen={modalAbrirOpen}
        onClose={() => setModalAbrirOpen(false)}
        onSuccess={cargarCajas}  // Recarga la lista después de abrir
      />
      <CerrarCajaModal
        isOpen={modalCerrarOpen}
        onClose={() => setModalCerrarOpen(false)}
        onSuccess={cargarCajas}  // Recarga la lista después de cerrar
        cajasAbiertas={cajas.filter(c => c.caja_estado)}  // Pasa las cajas abiertas al modal
      />


      

      {/* Lista de cajas */}
      {loading ? <p>Cargando...</p> : (
        <ul>
          {cajas.map(caja => (
            <li key={caja.id} style={{ margin: '10px 0', border: '1px solid #ccc', padding: '10px' }}>
              <p><strong>ID:</strong> {caja.id} | <strong>Usuario:</strong> {caja.usuario} | <strong>Estado:</strong> {caja.caja_estado ? 'Abierta' : 'Cerrada'}</p>
              <p><strong>Monto Inicial:</strong> {caja.caja_monto_inicial} | <strong>Saldo Calculado:</strong> {caja.saldo_calculado}</p>
              <p><strong>Apertura:</strong> {new Date(caja.caja_fecha_hora_apertura).toLocaleString()}</p>
              {caja.caja_fecha_hora_cierre && <p><strong>Cierre:</strong> {new Date(caja.caja_fecha_hora_cierre).toLocaleString()}</p>}
              <button onClick={() => handleEliminarCaja(caja.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CajaDashboard;