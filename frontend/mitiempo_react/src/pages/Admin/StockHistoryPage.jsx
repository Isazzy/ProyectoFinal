import React, { useState, useEffect } from 'react';
import { getStockHistory } from '../../api/productos'; // Usamos la función general
import toast from 'react-hot-toast';

export default function StockHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Llamamos a la API sin filtros para traer todo
        const { data } = await getStockHistory();
        setHistory(data);
      } catch (err) {
        toast.error("Error al cargar el historial general.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Historial General de Stock</h2>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              {/* Esta es la columna clave que diferencia este historial */}
              <th>Producto</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock Resultante</th>
              <th>Razón</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No hay movimientos de stock registrados.
                  </td>
                </tr>
            ) : (
              history.map((mov) => (
                <tr key={mov.id_history}>
                  <td data-label="Producto">
                    {/* El serializer nos da el StringRelatedField */}
                    <strong>{mov.producto}</strong>
                  </td>
                  <td data-label="Fecha">
                    {new Date(mov.fecha_movimiento).toLocaleString('es-AR')}
                  </td>
                  <td data-label="Tipo">{mov.tipo_movimiento}</td>
                  <td data-label="Cantidad"
                    className={mov.cantidad_movida > 0 ? 'stock-in' : 'stock-out'}
                  >
                    {mov.cantidad_movida > 0 ? `+${mov.cantidad_movida}` : mov.cantidad_movida}
                  </td>
                  <td data-label="Stock Resultante">{mov.stock_actual}</td>
                  <td data-label="Razón">{mov.razon || "N/A"}</td>
                  {/* Asumimos que el serializer de usuario devuelve un string */}
                  <td data-label="Usuario">{String(mov.usuario) || "Sistema"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <style>{`
        .stock-in { color: var(--success-color, #5cb85c); font-weight: 600; }
        .stock-out { color: var(--danger-color, #d9534f); font-weight: 600; }
        .admin-page-header h2 { margin-bottom: 0; }
      `}</style>
    </div>
  );
}