import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#f59e0b", "#3b82f6"]; // stock (naranja) / turnos (azul)

export const AlertasChart = ({ stockAlertas = 0, turnosAlertas = 0 }) => {

  const data = [
    { name: "Stock Bajo", value: stockAlertas },
    { name: "Turnos Pendientes", value: turnosAlertas }
  ];

  const total = stockAlertas + turnosAlertas;

  if (total === 0) {
    return (
      <div style={{
        height: 250, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontStyle: "italic", color: "#9ca3af"
      }}>
        No hay alertas actualmente.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={75}
            paddingAngle={5}
            dataKey="value"
            cx="50%"
            cy="50%"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => `${value} alerta(s)`}
            contentStyle={{
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          />

          <Legend verticalAlign="bottom" height={30} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
