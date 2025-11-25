"use client"

import React, { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { statsApi } from "../../api/statsApi"
import { formatCurrency } from "../../utils/formatters"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui" // Asegúrate de importar Card desde tu UI kit
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart" // Asumiendo que tienes estos componentes de Shadcn instalados
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select" // Asumiendo componentes de Shadcn

// Configuración de colores y etiquetas
const chartConfig = {
  visitors: {
    label: "Total",
  },
  servicios: {
    label: "Servicios",
    color: "#9B8DC5", // Tu color primario (Lila/Morado)
  },
  productos: {
    label: "Productos",
    color: "#10b981", // Color secundario (Verde Esmeralda)
  },
}

export function IngresosChart() {
  const [timeRange, setTimeRange] = useState("90d")
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          try {
              const dias = parseInt(timeRange.replace('d', ''));
              const data = await statsApi.getIngresosChart(dias);
              setChartData(data);
          } catch (error) {
              console.error("Error cargando gráfico", error);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [timeRange]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Evolución de Ingresos</CardTitle>
          <CardDescription>
            Comparativa de facturación por Servicios vs Productos
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Seleccionar rango"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Última semana
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
            <div className="h-[250px] w-full flex items-center justify-center text-gray-400">
                Cargando datos...
            </div>
        ) : chartData.length === 0 ? (
            <div className="h-[250px] w-full flex items-center justify-center text-gray-400">
                No hay datos de ventas en este período.
            </div>
        ) : (
            <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
            >
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="fillServicios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-servicios)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-servicios)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillProductos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-productos)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-productos)" stopOpacity={0.1} />
                </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("es-AR", {
                    month: "short",
                    day: "numeric",
                    })
                }}
                />
                <ChartTooltip
                cursor={false}
                content={
                    <ChartTooltipContent
                    labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("es-AR", {
                        weekday: "short",
                        day: "numeric",
                        month: "long",
                        })
                    }}
                    indicator="dot"
                    formatter={(value) => formatCurrency(value)}
                    />
                }
                />
                <Area
                dataKey="servicios"
                type="monotone"
                fill="url(#fillServicios)"
                stroke="var(--color-servicios)"
                stackId="a"
                strokeWidth={2}
                />
                <Area
                dataKey="productos"
                type="monotone"
                fill="url(#fillProductos)"
                stroke="var(--color-productos)"
                stackId="a"
                strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
            </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}