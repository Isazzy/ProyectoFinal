import React, { useState, useEffect } from "react";
import { getReportesDashboard } from "../../api/Ventas";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../../CSS/UsList.css"; // Reutilizar estilos de contenedor

const COLORS = ['#fb5b5b', '#3b82f6', '#10b981', '#f59e0b'];

export default function ReportesDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filtros de fecha (por defecto mes actual)
  const [fechaDesde, setFechaDesde] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const res = await getReportesDashboard({ fecha_desde: fechaDesde, fecha_hasta: fechaHasta });
      setData(res);
    } catch (err) {
      console.error(err);
      // toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para Recharts
  const datosFacturadas = data ? [
      { name: 'Servicios', value: parseFloat(data.ventas_facturadas.servicios) },
      { name: 'Productos', value: parseFloat(data.ventas_facturadas.productos) },
  ].filter(d => d.value > 0) : [];

  const datosPagos = data ? [
      { name: 'Efectivo', value: parseFloat(data.medios_de_pago.efectivo) },
      { name: 'Transferencia', value: parseFloat(data.medios_de_pago.transferencia) },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h2>Dashboard de Reportes</h2>
        
        <div className="search-filter-group" style={{alignItems:'center'}}>
            <input type="date" className="form-input" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            <span>a</span>
            <input type="date" className="form-input" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            <button className="btn btn-primary" onClick={cargarReportes}>Filtrar</button>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <div className="dashboard-grid" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem'}}>
            
            {/* Gráfico 1: Ventas Facturadas */}
            <div className="card" style={{padding:'20px'}}>
                <h3>Ventas Facturadas</h3>
                <div style={{height: '300px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={datosFacturadas}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {datosFacturadas.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="resumen-texto" style={{marginTop:'10px'}}>
                     <p>Total: <strong>${data?.ventas_facturadas.total}</strong></p>
                </div>
            </div>

            {/* Gráfico 2: Métodos de Pago */}
            <div className="card" style={{padding:'20px'}}>
                <h3>Métodos de Pago</h3>
                <div style={{height: '300px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={datosPagos}
                                cx="50%" cy="50%"
                                innerRadius={60} outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {datosPagos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="resumen-texto" style={{marginTop:'10px'}}>
                     <p>Total Recaudado: <strong>${data?.medios_de_pago.total}</strong></p>
                </div>
            </div>

        </div>
      )}
    </div>
  );
}