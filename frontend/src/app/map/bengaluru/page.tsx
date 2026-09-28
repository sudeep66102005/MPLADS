import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusDonutChart } from "@/components/charts/StatusDonutChart";
import { MapPanel } from "@/components/map/MapPanel";
import { Folder, AlertTriangle, Clock, IndianRupee, PieChart, BarChart3, ChevronDown, MapPin, Lightbulb } from "lucide-react";
import type { GeoPin } from "@/components/map/types";

const BENGALURU_CENTRE: [number, number] = [12.9716, 77.5946];
const bengaluruPins: GeoPin[] = [
  { id: "b1", lat: 12.9352, lng: 77.6245, status: "High Risk", label: "Drainage System Improvement", sublabel: "Koramangala", aiScore: 78 },
  { id: "b2", lat: 13.0358, lng: 77.5970, status: "Completed", label: "Community Hall", sublabel: "Hebbal" },
  { id: "b3", lat: 12.9698, lng: 77.7500, status: "Delayed", label: "Water Supply Upgrade", sublabel: "Whitefield" },
  { id: "b4", lat: 13.1007, lng: 77.5963, status: "Not Started", label: "School Renovation", sublabel: "Yelahanka" },
  { id: "b5", lat: 12.9784, lng: 77.6408, status: "In Progress", label: "Road Connectivity", sublabel: "Indiranagar" },
  { id: "b6", lat: 12.9141, lng: 77.6101, status: "Completed", label: "Primary Health Centre", sublabel: "Jayanagar" },
  { id: "b7", lat: 12.8452, lng: 77.6602, status: "In Progress", label: "Urban Park", sublabel: "Electronic City" },
  { id: "b8", lat: 12.9698, lng: 77.5299, status: "Delayed", label: "Sanitation Works", sublabel: "Rajarajeshwari Nagar" }
];

const distribution = [
  { label: "Roads & Transport", value: 24, pct: 25, color: "#2563eb" },
  { label: "Drinking Water", value: 18, pct: 19, color: "#60a5fa" },
  { label: "Sanitation", value: 16, pct: 17, color: "#10b981" },
  { label: "Healthcare", value: 14, pct: 15, color: "#ef4444" },
  { label: "Education & Other", value: 24, pct: 24, color: "#f59e0b" }
];

export default function BengaluruMapPage() {
  return (
    <AppShell>
      <PageHeader
        title="MPLADS Project Map"
        subtitle="Geospatial view of projects, risks and development coverage"
        right={<><Link href="/map" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Bengaluru Urban, Karnataka <ChevronDown size={14} className="ml-1 inline" /></Link><ExportButton label="Export Map" /></>}
      />

      <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={Folder} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Projects" value="96" subValue="↑ 8% vs. last year" subValueColor="text-emerald-600" trend />
        <KpiCard icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-600" label="High Risk" value="14" subValue="(14.6%)" subValueColor="text-red-600" />
        <KpiCard icon={Clock} iconBg="bg-red-50" iconColor="text-red-600" label="Delayed" value="18" subValue="(18.8%)" subValueColor="text-red-600" />
        <KpiCard icon={IndianRupee} iconBg="bg-blue-50" iconColor="text-blue-600" label="Total Allocation" value="₹ 186.4 Cr" />
        <KpiCard icon={PieChart} iconBg="bg-emerald-50" iconColor="text-emerald-600" label="Fund Utilization" value="76%" />
        <KpiCard icon={BarChart3} iconBg="bg-blue-50" iconColor="text-blue-600" label="Development Gaps" value="5" subValue="Key underserved areas" />
      </div>

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <input placeholder="Search by project name, location or ID..." className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        {["Taluk: All", "Assembly Constituency: All", "Project Status: All", "Agency: All", "AI Risk Level: All"].map((item) => <button key={item} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">{item} <ChevronDown size={12} className="inline" /></button>)}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        <div>
          <MapPanel center={BENGALURU_CENTRE} zoom={11} pins={bengaluruPins} height={445} />
          <div className="grid grid-cols-1 gap-3 mt-4 lg:grid-cols-3">
            <section className="card p-4">
              <h2 className="text-sm font-bold text-slate-800 mb-2">Sector-wise Project Distribution</h2>
              <div className="flex items-center gap-3"><StatusDonutChart data={distribution} total={96} /><ul className="space-y-1.5 text-[10px] flex-1">{distribution.map(d => <li key={d.label} className="flex justify-between gap-2"><span className="text-slate-500">{d.label}</span><strong>{d.value}</strong></li>)}</ul></div>
            </section>
            <section className="card p-4">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Project Trend in Bengaluru</h2>
              <div className="flex h-[160px] items-end justify-around gap-4">{[["2021",12],["2022",18],["2023",28],["2024",38]].map(([year,value]) => <div key={year} className="flex h-full flex-1 flex-col justify-end text-center"><strong className="text-xs">{value}</strong><div className="mx-auto w-8 rounded-t bg-blue-500" style={{height:`${Number(value)*3}px`}} /><span className="mt-1 text-[10px] text-slate-500">{year}</span></div>)}</div>
            </section>
            <section className="card p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3"><Lightbulb size={15} className="text-blue-600" /> AI Insights</h2>
              <ul className="space-y-3 text-[11px] text-slate-600"><li>Good utilization at 76%, but 18 projects may be delayed.</li><li>Sanitation and drainage projects carry the highest risk.</li><li>Focus on healthcare and drinking water in East Bengaluru.</li></ul>
            </section>
          </div>
        </div>

        <aside className="space-y-3">
          <section className="card p-4"><h2 className="text-sm font-bold text-slate-800 mb-2">Selected Location</h2><p className="flex items-center gap-2 font-bold text-slate-800"><MapPin size={16} className="text-blue-600" /> Bengaluru Urban</p><p className="text-xs text-slate-500 ml-6">Karnataka</p><div className="grid grid-cols-3 gap-2 mt-3 text-center"><div className="bg-blue-50 p-2 rounded"><small>Total Projects</small><strong className="block">96</strong></div><div className="bg-blue-50 p-2 rounded"><small>Allocation</small><strong className="block">₹186.4 Cr</strong></div><div className="bg-blue-50 p-2 rounded"><small>Utilization</small><strong className="block">76%</strong></div></div></section>
          <section className="card p-4"><h2 className="text-sm font-bold text-slate-800 mb-2">Top Issues in Bengaluru</h2>{["Drainage & Sanitation", "Healthcare Infrastructure", "Road Connectivity", "Education Facilities"].map((x,i)=><div key={x} className="flex gap-2 border-t border-slate-100 py-2 text-xs"><span className="font-bold text-blue-600">{i+1}</span><span>{x}</span></div>)}</section>
          <section className="card p-4"><h2 className="text-sm font-bold text-slate-800 mb-2">Underserved Areas (Ward Level)</h2>{["East Bengaluru", "South Bengaluru", "West Bengaluru"].map((x,i)=><div key={x} className="border-t border-slate-100 py-2 text-xs"><strong>{i+1}. {x}</strong><p className="text-slate-500">Low infrastructure coverage</p></div>)}</section>
        </aside>
      </div>
    </AppShell>
  );
}
