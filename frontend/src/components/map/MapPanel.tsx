"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { classNames } from "@/lib/format";
import type { GeoHeatZone, GeoPin } from "./types";

/**
 * Leaflet must not be server-rendered (it dereferences `window` at import
 * time), so the actual map is loaded client-side only.
 */
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 gap-2">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-xs">Loading map…</span>
    </div>
  )
});

export interface MapPanelProps {
  center: [number, number];
  zoom?: number;
  pins: GeoPin[];
  heatZones?: GeoHeatZone[];
  activePinId?: string;
  /** Panel height in px. */
  height?: number;
  /** Hides the Map/Satellite switcher when false. */
  showBasemapToggle?: boolean;
}

export function MapPanel({
  center,
  zoom = 11,
  pins,
  heatZones = [],
  activePinId,
  height = 420,
  showBasemapToggle = true
}: MapPanelProps) {
  const [basemap, setBasemap] = useState<"map" | "satellite">("map");
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Remount the map when the basemap changes so tiles swap cleanly.
  const mapKey = useMemo(() => `${basemap}-${center[0]}-${center[1]}`, [basemap, center]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
      style={{ height }}
    >
      {showBasemapToggle ? (
        <div className="absolute top-3 left-3 z-[500] flex rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm text-xs font-semibold">
          <button
            onClick={() => setBasemap("map")}
            className={classNames("px-3 py-1.5", basemap === "map" ? "bg-blue-600 text-white" : "text-slate-600")}
          >
            Map
          </button>
          <button
            onClick={() => setBasemap("satellite")}
            className={classNames(
              "px-3 py-1.5",
              basemap === "satellite" ? "bg-blue-600 text-white" : "text-slate-600"
            )}
          >
            Satellite
          </button>
        </div>
      ) : null}

      {heatZones.length > 0 ? (
        <label className="absolute top-3 right-3 z-[500] flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white shadow-sm px-2.5 py-1.5 text-xs font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap((v) => !v)}
            className="w-3.5 h-3.5 accent-blue-600"
          />
          Risk Heatmap
        </label>
      ) : null}

      <LeafletMap
        key={mapKey}
        center={center}
        zoom={zoom}
        pins={pins}
        heatZones={heatZones}
        activePinId={activePinId}
        showHeatmap={showHeatmap}
        basemap={basemap}
      />
    </div>
  );
}
