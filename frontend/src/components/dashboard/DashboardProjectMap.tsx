"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MapPanel } from "@/components/map/MapPanel";
import { BHOPAL_CENTRE, bhopalMapPins } from "@/lib/mockData";

const legend = [
  { label: "Completed", color: "bg-emerald-500" },
  { label: "In Progress", color: "bg-blue-500" },
  { label: "Delayed", color: "bg-red-500" },
  { label: "Not Started", color: "bg-amber-400" }
];

export function DashboardProjectMap() {
  return (
    <section className="card p-3.5 h-full">
      <h2 className="text-sm font-bold text-slate-800 mb-2.5">Project Locations</h2>
      <div className="dashboard-map relative">
        <MapPanel
          center={BHOPAL_CENTRE}
          zoom={9}
          pins={bhopalMapPins}
          height={206}
          showBasemapToggle={false}
        />

        <div className="absolute right-2.5 top-2.5 z-[500] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
          <div className="space-y-1.5">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[10.5px] text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/map"
          className="absolute bottom-2.5 right-2.5 z-[500] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          View Full Map <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
