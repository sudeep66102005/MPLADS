"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

interface AnalysisRadarChartProps {
  data: { metric: string; value: number }[];
}

/**
 * Radar chart whose axis labels carry the metric name *and* its value on a
 * second line (e.g. "Financial Progress" / "82%"), as in the reference design.
 */
function AxisTick({ payload, x, y, cx, cy, data }: any) {
  const point = data.find((d: { metric: string }) => d.metric === payload.value);
  // Nudge labels outward from the centre so they clear the plot area.
  const dx = (x - cx) * 0.14;
  const dy = (y - cy) * 0.14;
  const anchor = Math.abs(x - cx) < 24 ? "middle" : x > cx ? "start" : "end";

  return (
    <g transform={`translate(${x + dx},${y + dy})`}>
      <text textAnchor={anchor} fill="#64748b" fontSize={8.5}>
        <tspan x={0} dy={0}>
          {payload.value}
        </tspan>
        <tspan x={0} dy={10} fontWeight={700} fill="#334155" fontSize={9.5}>
          {point ? `${point.value}%` : ""}
        </tspan>
      </text>
    </g>
  );
}

export function AnalysisRadarChart({ data }: AnalysisRadarChartProps) {
  return (
    <div className="h-[186px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="58%" margin={{ top: 6, right: 44, bottom: 6, left: 44 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="metric"
            tick={(props) => <AxisTick {...props} data={data} />}
          />
          <Radar
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={1.5}
            fill="#3b82f6"
            fillOpacity={0.3}
            dot={{ r: 2, fill: "#2563eb", strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
