"use client";

import { useState } from "react";
import { Plus, Minus, LocateFixed } from "lucide-react";
import { classNames } from "@/lib/format";

export interface MapPin {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  status: "Completed" | "In Progress" | "Delayed" | "High Risk" | "Not Started";
  label?: string;
}

export interface MapArea {
  id: string;
  x: number;
  y: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

export interface HeatZone {
  x: number;
  y: number;
  radius: number; // px
  intensity: "high" | "medium";
}

const statusDotColor: Record<MapPin["status"], string> = {
  Completed: "bg-emerald-500",
  "In Progress": "bg-blue-500",
  Delayed: "bg-amber-500",
  "High Risk": "bg-red-500",
  "Not Started": "bg-purple-500"
};

interface MapPanelProps {
  pins: MapPin[];
  areas: MapArea[];
  heatZones?: HeatZone[];
  activePinId?: string;
  onPinClick?: (id: string) => void;
  roads?: { label: string; x: number; y: number; rotate?: number }[];
  cityLabel: string;
  scaleLabel?: string;
}

export function MapPanel({
  pins,
  areas,
  heatZones = [],
  activePinId,
  onPinClick,
  roads = [],
  cityLabel,
  scaleLabel = "0   5   10   20 km"
}: MapPanelProps) {
  const [tab, setTab] = useState<"map" | "satellite">("map");

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-[420px] bg-[#eef2f0]">
      {/* Map / Satellite tabs */}
      <div className="absolute top-3 left-3 z-20 flex rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm text-xs font-semibold">
        <button
          onClick={() => setTab("map")}
          className={classNames("px-3 py-1.5", tab === "map" ? "bg-blue-600 text-white" : "text-slate-600")}
        >
          Map
        </button>
        <button
          onClick={() => setTab("satellite")}
          className={classNames("px-3 py-1.5", tab === "satellite" ? "bg-blue-600 text-white" : "text-slate-600")}
        >
          Satellite
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-16 left-3 z-20 flex flex-col rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
        <button className="p-2 hover:bg-slate-50 border-b border-slate-100">
          <Plus size={14} />
        </button>
        <button className="p-2 hover:bg-slate-50">
          <Minus size={14} />
        </button>
      </div>
      <button className="absolute bottom-10 left-3 z-20 p-2 rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-slate-50">
        <LocateFixed size={14} />
      </button>

      {/* Base map surface */}
      <div
        className={classNames(
          "absolute inset-0",
          tab === "map"
            ? "bg-[#e7edf0]"
            : "bg-[#3a4a3a]"
        )}
      >
        {/* faux green belt / park */}
        <div className="absolute rounded-[45%] bg-[#d7e8d2]" style={{ left: "8%", top: "55%", width: "26%", height: "30%" }} />
        <div className="absolute rounded-[45%] bg-[#d7e8d2]" style={{ left: "58%", top: "10%", width: "20%", height: "18%" }} />
        {/* faux water body */}
        <div className="absolute rounded-[50%] bg-[#bcd6e6]" style={{ left: "34%", top: "38%", width: "16%", height: "20%" }} />

        {/* faux roads */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <line x1="5%" y1="20%" x2="95%" y2="60%" stroke="#ffffff" strokeWidth="3" />
          <line x1="10%" y1="80%" x2="90%" y2="15%" stroke="#ffffff" strokeWidth="2" />
          <line x1="50%" y1="0%" x2="45%" y2="100%" stroke="#ffffff" strokeWidth="2" />
          <line x1="0%" y1="50%" x2="100%" y2="45%" stroke="#f5d98a" strokeWidth="2.5" />
        </svg>

        {roads.map((r, idx) => (
          <span
            key={idx}
            className="absolute text-[10px] text-slate-500 font-medium"
            style={{ left: `${r.x}%`, top: `${r.y}%`, transform: `rotate(${r.rotate ?? 0}deg)` }}
          >
            {r.label}
          </span>
        ))}

        {/* Heat zones (risk hotspots) */}
        {heatZones.map((zone, idx) => (
          <div
            key={idx}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: zone.radius,
              height: zone.radius,
              transform: "translate(-50%, -50%)",
              background:
                zone.intensity === "high"
                  ? "radial-gradient(circle, rgba(220,38,38,0.45) 0%, rgba(220,38,38,0.08) 70%, transparent 100%)"
                  : "radial-gradient(circle, rgba(217,119,6,0.35) 0%, rgba(217,119,6,0.06) 70%, transparent 100%)"
            }}
          />
        ))}

        {/* Area / city labels */}
        {areas.map((area) => (
          <span
            key={area.id}
            className={classNames(
              "absolute font-semibold text-slate-600 -translate-x-1/2 -translate-y-1/2",
              area.size === "lg" ? "text-sm" : area.size === "md" ? "text-xs" : "text-[10px]"
            )}
            style={{ left: `${area.x}%`, top: `${area.y}%` }}
          >
            {area.label}
          </span>
        ))}

        {/* Central city marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 font-bold text-slate-700 text-base"
          style={{ left: "50%", top: "48%" }}
        >
          {cityLabel}
        </div>

        {/* Project pins */}
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => onPinClick?.(pin.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <span
              className={classNames(
                "block rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125",
                statusDotColor[pin.status],
                pin.id === activePinId ? "w-4 h-4 ring-2 ring-offset-1 ring-blue-500" : "w-3 h-3"
              )}
            />
          </button>
        ))}
      </div>

      {/* Scale */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 bg-white/80 px-2 py-0.5 rounded z-20">
        {scaleLabel}
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] text-slate-400 z-20">
        Map data © 2024 Google · Terms of Use
      </div>
    </div>
  );
}
