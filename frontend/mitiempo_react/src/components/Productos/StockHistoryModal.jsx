// src/components/Productos/StockHistoryModal.jsx
//PUEDE SER QUE LO ELIMINE
import React, { useState, useEffect } from 'react';
import Modal from '../Common/Modal';
import { getStockHistoryByProducto } from '../../api/productos';
import toast from 'react-hot-toast';

// 💡 1. Importamos el nuevo archivo CSS
import '../../CSS/StockHistoryModal.css';

export default function StockHistoryModal({ productoId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productoId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await getStockHistoryByProducto(productoId);
        setHistory(data);
      } catch (err) {
        toast.error("Error al cargar el historial.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [productoId]);

  return (
    <Modal isOpen={true} onClose={onClose} title="Historial de Movimientos">
      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        // 💡 2. Se elimina style={{ margin: 0 }} 
        //    y se añade la clase 'history-table'
        <table className="styled-table history-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock Resultante</th>
              <th>Razón</th>
            </tr>
          </thead>
          <tbody>
            {history.map((mov) => (
              <tr key={mov.id_history}>
                <td data-label="Fecha">
                  {new Date(mov.fecha_movimiento).toLocaleString('es-AR')}
                </td>
                <td data-label="Tipo">{mov.tipo_movimiento}</td>
                <td data-label="Cantidad" 
                    // 💡 3. Estas clases ahora se definen en el CSS
                    className={mov.cantidad_movida > 0 ? 'stock-in' : 'stock-out'}>
                  {mov.cantidad_movida > 0 ? `+${mov.cantidad_movida}` : mov.cantidad_movida}
                </td>
                <td data-label="Stock Resultante">{mov.stock_actual}</td>
                <td data-label="Razón">{mov.razon || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* 💡 4. El bloque <style> se ha eliminado */}
    </Modal>
  );
}