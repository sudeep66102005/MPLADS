"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface FundUtilizationChartProps {
  data: { year: string; allocated: number; utilized: number }[];
}

export function FundUtilizationChart({ data }: FundUtilizationChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const measure = () => {
      const nextWidth = Math.floor(containerRef.current?.getBoundingClientRect().width ?? 320);
      if (nextWidth > 0) setWidth(nextWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={containerRef} className="h-[190px] w-full overflow-hidden">
        <AreaChart width={width} height={190} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAllocated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradUtilized" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.24} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 350]}
            ticks={[0, 50, 100, 150, 200, 250, 300, 350]}
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={44}
            label={{
              value: "Amount (₹ Cr)",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 10, fill: "#94a3b8", textAnchor: "middle" }
            }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`₹${value} Cr`, name]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />

          <Area
            type="monotone"
            dataKey="allocated"
            name="Allocated"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#gradAllocated)"
            dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="utilized"
            name="Utilized"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#gradUtilized)"
            dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
          />
        </AreaChart>
    </div>
  );
}
