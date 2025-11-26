// ========================================
// src/components/Charts/PagosChart.jsx
// Gráfico Mejorado de Medios de Pago
// ========================================
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/formatters";

const COLORS = ["#10b981", "#8b5cf6"]; // Verde Esmeralda (Efectivo), Violeta (Transferencia)

export const PagosChart = ({ data }) => {
  // Manejo de formato: puede venir como array [{ metodoPago, total }] o como objeto { efectivo, transferencia }
  let chartData = [];

  if (Array.isArray(data)) {
    // Si viene como array desde el backend
    chartData = data.map(item => ({
      name: item.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia',
      value: parseFloat(item.total || 0)
    }));
  } else if (typeof data === 'object' && data !== null) {
    // Si viene como objeto { efectivo: X, transferencia: Y }
    chartData = [
      { name: "Efectivo", value: parseFloat(data.efectivo || 0) },
      { name: "Transferencia", value: parseFloat(data.transferencia || 0) },
    ];
  }

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  // Si no hay datos (total es 0), mostramos mensaje de estado vacío
  if (total === 0 || chartData.length === 0) {
      return (
          <div style={{
              height: 250, 
              display: 'flex', 
              alignItems:'center', 
              justifyContent:'center', 
              color: '#9ca3af',
              fontStyle: 'italic',
              flexDirection: 'column',
              gap: 10
          }}>
              <p style={{ margin: 0 }}>No hay registros de pagos en este período.</p>
          </div>
      );
  }

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60} // Hace que sea una dona (Donut Chart)
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '10px'
            }}
            itemStyle={{ color: '#334155', fontWeight: 600 }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
                <span style={{ color: '#475569', fontWeight: 500, marginLeft: 5 }}>
                  {value}: {formatCurrency(entry.payload.value)}
                </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};