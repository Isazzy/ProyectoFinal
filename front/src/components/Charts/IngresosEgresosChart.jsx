// ========================================
// src/components/Charts/IngresosEgresosChart.jsx
// Gráfico de Barras para Ingresos vs Egresos
// ========================================
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";
import { dashboardApi } from "../../api/dashboardApi";
import { Loader } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "12px 16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p style={{ margin: 0, marginBottom: 8, fontWeight: 600, color: "#334155" }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            style={{
              margin: 0,
              color: entry.color,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: entry.color,
              }}
            ></span>
            <span style={{ fontWeight: 500 }}>{entry.name}:</span>
            <strong>{formatCurrency(entry.value)}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const IngresosEgresosChart = ({ periodo = "mes" }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Determinar días según el período
        const dias = periodo === "semana" ? 7 : periodo === "mes" ? 30 : 90;
        
        // Obtener datos del endpoint de ingresos
        const ingresosData = await dashboardApi.getIngresosEgresos(dias);
        
        // Transformar datos para el gráfico
        const chartData = ingresosData.map((item) => ({
          fecha: new Date(item.date).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
          }),
          Ingresos: parseFloat(item.ingresos || 0),
          Egresos: parseFloat(item.egresos || 0),
          Balance: parseFloat(item.ingresos || 0) - parseFloat(item.egresos || 0),
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error cargando datos financieros:", error);
        // Datos de ejemplo en caso de error
        setData(generarDatosEjemplo(periodo));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [periodo]);

  const generarDatosEjemplo = (periodo) => {
    const dias = periodo === "semana" ? 7 : periodo === "mes" ? 30 : 90;
    const datos = [];
    const hoy = new Date();

    for (let i = dias - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      
      const ingresos = Math.random() * 50000 + 10000;
      const egresos = Math.random() * 30000 + 5000;

      datos.push({
        fecha: fecha.toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        }),
        Ingresos: parseFloat(ingresos.toFixed(2)),
        Egresos: parseFloat(egresos.toFixed(2)),
        Balance: parseFloat((ingresos - egresos).toFixed(2)),
      });
    }

    return datos;
  };

  if (loading) {
    return (
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        <Loader size={32} className="animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 10,
          color: "#94a3b8",
        }}
      >
        <p style={{ margin: 0, fontStyle: "italic" }}>
          No hay datos financieros para este período
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="fecha"
            stroke="#64748b"
            style={{ fontSize: "0.75rem" }}
            tick={{ fill: "#64748b" }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: "0.75rem" }}
            tick={{ fill: "#64748b" }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
            iconType="circle"
          />
          <Bar
            dataKey="Ingresos"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar
            dataKey="Egresos"
            fill="#f59e0b"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};