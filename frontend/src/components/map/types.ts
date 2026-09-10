import type { ProjectStatus } from "@/lib/types";

/**
 * Geographic map contracts.
 *
 * These replaced an earlier percentage-offset (x/y) based stand-in map.
 * Everything is now real WGS84 lat/lng, so the same data can be fed to any
 * map SDK (Leaflet, MapLibre, Google Maps) without transformation, and can
 * come straight from the backend's `location: {lat, lng}` field.
 */

export interface GeoPin {
  id: string;
  lat: number;
  lng: number;
  status: ProjectStatus;
  /** Project name, shown in the pin popup. */
  label?: string;
  /** MPLADS project code, e.g. MPLADS/2023/001 */
  code?: string;
  /** 0-100 AI risk score, shown in the popup when present. */
  aiScore?: number;
  /** Ward / locality line shown under the project name. */
  sublabel?: string;
}

export interface GeoHeatZone {
  id: string;
  lat: number;
  lng: number;
  /** Radius in METRES (Leaflet Circle uses metres, not pixels). */
  radiusMetres: number;
  intensity: "high" | "medium";
  label?: string;
}

export const STATUS_HEX: Record<ProjectStatus, string> = {
  Completed: "#10b981",
  "In Progress": "#3b82f6",
  Delayed: "#f59e0b",
  "High Risk": "#ef4444",
  "Not Started": "#a855f7"
};
