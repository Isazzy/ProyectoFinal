import React, { useState, useEffect } from 'react';
import { getProductosBajoStock } from '../../api/productos';
import { Link } from 'react-router-dom';

export default function DashboardAlerts() {
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const { data } = await getProductosBajoStock();
        setLowStockCount(data.length);
      } catch (error) {
        console.error("Error fetching low stock alert:", error);
      }
    };
    fetchLowStock();
  }, []);

  if (lowStockCount === 0) {
    return null; // No muestra nada si no hay alertas
  }

  return (
    <div className="dashboard-alert low-stock-alert">
      <p>
        <strong>¡Alerta!</strong> Tienes <strong>{lowStockCount}</strong> producto(s)
        por debajo del stock mínimo.
      </p>
      <Link to="/admin/dashboard/productos?filtro=bajo_stock" className="btn btn-danger btn-sm">
        Ver Productos
      </Link>
      <style>{`
        .dashboard-alert {
          padding: 1rem;
          margin: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--danger-color-light);
          border: 1px solid var(--danger-color);
          color: var(--danger-color);
        }
        .dashboard-alert p {
          margin: 0;
        }
        .btn-sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}