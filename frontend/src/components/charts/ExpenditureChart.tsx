"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ExpenditureChartProps {
  data: { quarter: string; cumulative: number; expected: number }[];
  maxCr: number;
}

/** Cumulative expenditure (bars) against expected expenditure (dashed line). */
export function ExpenditureChart({ data, maxCr }: ExpenditureChartProps) {
  return (
    <div className="h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -6, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 7.5, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, maxCr]}
            tickFormatter={(v) => `${v} Cr`}
            tick={{ fontSize: 7.5, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`₹${value} Cr`, name]}
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
          />
          <Bar
            dataKey="cumulative"
            name="Cumulative Expenditure"
            fill="#3b82f6"
            radius={[2, 2, 0, 0]}
            barSize={14}
          />
          <Line
            type="monotone"
            dataKey="expected"
            name="Expected Expenditure"
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
