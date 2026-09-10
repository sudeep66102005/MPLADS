"use client";

import {
  Bar,
  ComposedChart,
  Line,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ConstituencyTrendPoint } from "@/lib/types";

export function InvestmentTrendChart({ data }: { data: ConstituencyTrendPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="fundsReleasedCr" name="Funds Released (₹ Cr)" fill="#93b4f5" radius={[4, 4, 0, 0]} barSize={18} />
          <Bar yAxisId="left" dataKey="expenditureCr" name="Expenditure (₹ Cr)" fill="#1e4fd6" radius={[4, 4, 0, 0]} barSize={18} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgPhysicalProgressPct"
            name="Average Physical Progress (%)"
            stroke="#1f8a4c"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
