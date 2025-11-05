// src/components/Common/DashboardAlerts.jsx
import React, { useState, useEffect } from 'react';
import { getProductosBajoStock } from '../../api/productos';
import { Link } from 'react-router-dom';

// 💡 1. Importamos el nuevo CSS
import '../../CSS/DashboardAlerts.css';

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
    // 💡 2. Clases combinadas: hereda colores y bordes de .alert-error
    //    y el layout flex de .dashboard-alert
    <div className="alert alert-error dashboard-alert">
      <p>
        <strong>¡Alerta!</strong> Tienes <strong>{lowStockCount}</strong> producto(s)
        por debajo del stock mínimo.
      </p>
      {/* 💡 3. El .btn-sm ahora es una clase global (ver App.css) */}
      <Link to="/admin/dashboard/productos?filtro=bajo_stock" className="btn btn-danger btn-sm">
        Ver Productos
      </Link>
      
      {/* 💡 4. El bloque <style> se ha eliminado */}
    </div>
  );
}