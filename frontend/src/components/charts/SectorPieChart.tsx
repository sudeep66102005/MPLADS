"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SectorPieChartProps {
  data: { sector: string; value: number; pct: number; color: string }[];
  centerLabel?: string;
}

export function SectorPieChart({ data, centerLabel }: SectorPieChartProps) {
  return (
    <div className="relative h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="sector"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.sector} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} projects`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-xs text-slate-600">
                {value} <span className="font-semibold">{entry?.payload?.pct}%</span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-[55%] h-full">
          <span className="text-2xl font-bold text-slate-900">{centerLabel}</span>
          <span className="text-[10px] text-slate-400">Projects</span>
        </div>
      ) : null}
    </div>
  );
}
