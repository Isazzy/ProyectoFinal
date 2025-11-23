import React, { useState, useEffect } from "react";
import { getVentas } from "../../api/ventas"; // Asumimos que getVentas trae la info completa
import toast from "react-hot-toast";
import { Eye } from "lucide-react";
import VentaModal from "../../components/Ventas/VentaModal"; // Reutilizamos para ver detalle

import "../../CSS/UsList.css"; // Reutilizamos estilos de tabla

export default function VentasList() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVentaId, setSelectedVentaId] = useState(null);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      setVentas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar ventas");
    } finally {
      setLoading(false);
    }
  };

  const filteredVentas = ventas.filter(v => 
    v.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id_venta.toString().includes(searchTerm)
  );

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Listado de Ventas / Pagos</h2>
      </div>

      <div className="toolbar">
        <h3 className="toolbar-title">Transacciones ({filteredVentas.length})</h3>
        <div className="search-filter-group">
          <input 
            type="text" 
            placeholder="Buscar por Cliente o ID..." 
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Detalle</th>
            <th>Monto</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredVentas.length === 0 ? (
             <tr><td colSpan="7" className="text-center">No hay ventas registradas.</td></tr>
          ) : (
             filteredVentas.map(v => (
               <tr key={v.id_venta}>
                 <td data-label="ID">#{v.id_venta}</td>
                 <td data-label="Fecha">{new Date(v.fecha).toLocaleString()}</td>
                 <td data-label="Cliente">
                    <div className="user-info-text">
                        <span className="user-full-name">{v.cliente_nombre || "Eventual"}</span>
                    </div>
                 </td>
                 <td data-label="Detalle">
                    {v.detalles ? `${v.detalles.length} ítems` : 'Sin detalles'}
                 </td>
                 <td data-label="Monto">
                    <span style={{fontWeight: 'bold', color: 'var(--color-success)'}}>
                        ${parseFloat(v.total).toFixed(2)}
                    </span>
                 </td>
                 <td data-label="Estado">
                    <span className={`badge ${v.estado_pago === 'PAGADO' ? 'badge-cliente' : 'badge-admin'}`}>
                        {v.estado_pago}
                    </span>
                 </td>
                 <td data-label="Acciones" className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedVentaId(v.id_venta)}>
                        <Eye size={16} /> Ver
                    </button>
                 </td>
               </tr>
             ))
          )}
        </tbody>
      </table>

      {selectedVentaId && (
          <VentaModal 
            ventaId={selectedVentaId} 
            onClose={() => setSelectedVentaId(null)} 
            onSuccess={cargarVentas}
          />
      )}
    </div>
  );
}