"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function FinancialAreaChart({
  data
}: {
  data: { quarter: string; cumulative: number; expected: number }[];
}) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="cumulative" name="Cumulative Expenditure (₹ Cr)" stroke="#1e4fd6" strokeWidth={2} dot={{ r: 3 }} />
          <Line
            type="monotone"
            dataKey="expected"
            name="Expected Expenditure (₹ Cr)"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
