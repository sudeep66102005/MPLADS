"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer
} from "recharts";

export function ProjectRadarChart({ data }: { data: { metric: string; value: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#e4e8f0" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#64748b" }} />
          <Radar dataKey="value" stroke="#1e4fd6" fill="#1e4fd6" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
