"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface StatusDonutChartProps {
  data: { label: string; value: number; pct: number; color: string }[];
  total: number;
}

export function StatusDonutChart({ data, total }: StatusDonutChartProps) {
  return (
    <div className="relative w-[168px] h-[168px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={54}
            outerRadius={80}
            paddingAngle={1}
            // Start at 12 o'clock and sweep clockwise.
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} projects`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[26px] font-bold leading-none text-slate-900">{total}</span>
        <span className="text-[11px] text-slate-400 mt-0.5">Projects</span>
      </div>
    </div>
  );
}
