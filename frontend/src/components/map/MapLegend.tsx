"use client";

import { useState } from "react";

const statusLegend = [
  { label: "Completed", color: "bg-emerald-500" },
  { label: "In Progress", color: "bg-blue-500" },
  { label: "Delayed", color: "bg-amber-500" },
  { label: "High Risk", color: "bg-red-500" },
  { label: "Not Started", color: "bg-purple-500" }
];

const layerToggles = [
  "Show Heatmap (Risk)",
  "Assembly Boundaries",
  "Ward Boundaries",
  "Major Infrastructure",
  "Underdeveloped Areas"
];

export function MapLegend() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    "Show Heatmap (Risk)": true,
    "Assembly Boundaries": true,
    "Ward Boundaries": true,
    "Major Infrastructure": true,
    "Underdeveloped Areas": false
  });

  return (
    <div className="card p-4 text-xs">
      <p className="text-xs font-semibold text-slate-500 mb-2">Project Status</p>
      <div className="space-y-1.5 mb-3">
        {statusLegend.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span className="text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-2 pt-2 border-t border-slate-100">Map Layers</p>
      <div className="space-y-1.5">
        {layerToggles.map((label) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked[label] ?? false}
              onChange={() => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
              className="w-3.5 h-3.5 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-slate-600">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
