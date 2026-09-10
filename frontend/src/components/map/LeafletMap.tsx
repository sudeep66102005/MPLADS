"use client";

import "leaflet/dist/leaflet.css";

import { Circle, CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";

import { STATUS_HEX, type GeoHeatZone, type GeoPin } from "./types";

/**
 * Real Leaflet map.
 *
 * Deliberately uses only key-free tile providers so the dashboard runs with
 * zero configuration and no billing account:
 *   - Street:    OpenStreetMap standard tiles
 *   - Satellite: Esri World Imagery
 *
 * Project markers are drawn as `CircleMarker`s rather than default Leaflet
 * markers on purpose: Leaflet's default marker uses image assets whose URLs
 * break under bundlers (the well-known "marker icon 404" problem), and
 * circles also match the reference dashboard design more closely.
 *
 * This component must only ever be rendered client-side — Leaflet touches
 * `window` on import. `MapPanel` handles that via `next/dynamic` with
 * `ssr: false`.
 */

const TILE_LAYERS = {
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics"
  }
} as const;

/** Keeps the Leaflet canvas correctly sized when its container changes size. */
function ResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    // Run once after mount (container may have been 0-height during render)
    const timer = setTimeout(invalidate, 200);
    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);
  return null;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  pins: GeoPin[];
  heatZones: GeoHeatZone[];
  activePinId?: string;
  showHeatmap: boolean;
  basemap: "map" | "satellite";
}

export default function LeafletMap({
  center,
  zoom,
  pins,
  heatZones,
  activePinId,
  showHeatmap,
  basemap
}: LeafletMapProps) {
  const tiles = TILE_LAYERS[basemap];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      // Page-scroll hijacking is a common complaint with embedded maps;
      // users can still zoom with the on-map +/- controls.
      scrollWheelZoom={false}
      className="h-full w-full z-0"
    >
      <ResizeHandler />
      <TileLayer url={tiles.url} attribution={tiles.attribution} />

      {showHeatmap &&
        heatZones.map((zone) => {
          const color = zone.intensity === "high" ? "#dc2626" : "#d97706";
          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMetres}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: zone.intensity === "high" ? 0.28 : 0.18,
                weight: 1,
                opacity: 0.4
              }}
            >
              {zone.label ? <Tooltip>{zone.label}</Tooltip> : null}
            </Circle>
          );
        })}

      {pins.map((pin) => {
        const isActive = pin.id === activePinId;
        return (
          <CircleMarker
            key={pin.id}
            center={[pin.lat, pin.lng]}
            radius={isActive ? 9 : 6}
            pathOptions={{
              color: "#ffffff",
              weight: isActive ? 3 : 2,
              fillColor: STATUS_HEX[pin.status],
              fillOpacity: 1
            }}
          >
            {(pin.label || pin.code) && (
              <Popup>
                <div className="min-w-[180px]">
                  {pin.label ? (
                    <p className="text-xs font-semibold text-slate-800 mb-0.5">{pin.label}</p>
                  ) : null}
                  {pin.sublabel ? <p className="text-[11px] text-slate-500">{pin.sublabel}</p> : null}
                  {pin.code ? <p className="text-[10px] text-slate-400 mb-1">{pin.code}</p> : null}
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: STATUS_HEX[pin.status] }}
                    />
                    <span className="text-[11px] font-medium text-slate-600">{pin.status}</span>
                    {typeof pin.aiScore === "number" ? (
                      <span className="text-[11px] text-slate-500">· AI Score: {pin.aiScore}</span>
                    ) : null}
                  </div>
                </div>
              </Popup>
            )}
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
