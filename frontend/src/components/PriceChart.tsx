import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { HistoryPoint } from "../types/finance";
import { formatCurrency, formatDate } from "../lib/utils";

type PriceChartProps = {
  points: HistoryPoint[];
  currency: string;
};

export function PriceChart({ points, currency }: PriceChartProps) {
  const chartData = points.map((point) => ({
    ...point,
    label: formatDate(point.date),
    close: point.close ?? null
  }));

  return (
    <div className="glass-card p-4">
      <div className="mb-4 text-sm font-medium text-slate-200">Price history</div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="northstarArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgba(16,185,129,0.9)" stopOpacity={0.7} />
                <stop offset="95%" stopColor="rgba(16,185,129,0.05)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.10)" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} minTickGap={24} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              domain={["auto", "auto"]}
              tickFormatter={(value: number) => formatCurrency(value, currency)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 16
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
              labelFormatter={(label) => `${label}`}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#northstarArea)"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
