"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
type Place = {id: string; name: string; riskLevel: string; location: {lat: number; lng: number}};
export default function LiveMap({projects, onOpen}: {projects: Place[]; onOpen: (id: string) => void}) {
  const valid = projects.filter(p => Number.isFinite(p.location?.lat) && Number.isFinite(p.location?.lng));
  if (!valid.length) return <p>No project coordinates are available.</p>;
  return <div className="h-[460px] rounded-xl overflow-hidden relative z-0"><MapContainer key={valid[0].id} center={[valid[0].location.lat, valid[0].location.lng]} zoom={10} className="h-full w-full">
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {valid.map(p => <CircleMarker key={p.id} center={[p.location.lat,p.location.lng]} radius={8} pathOptions={{color: ["High","Critical"].includes(p.riskLevel) ? "#dc2626" : "#2563eb", fillOpacity:.8}}><Popup><strong>{p.name}</strong><p>{p.riskLevel} priority</p><button className="text-blue-700 underline" onClick={() => onOpen(p.id)}>Open project</button></Popup></CircleMarker>)}
  </MapContainer></div>;
}
