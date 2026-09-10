"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CoverageBarChartProps {
  data: { sector: string; implemented: number; estimatedNeed: number }[];
}

export function CoverageBarChart({ data }: CoverageBarChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis dataKey="sector" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="implemented" name="Projects Implemented" fill="#93b4f5" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="estimatedNeed" name="Estimated Need" fill="#1e4fd6" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
