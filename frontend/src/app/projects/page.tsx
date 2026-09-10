import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, ExportButton } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Badge, riskBadgeColor, statusBadgeColor } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  Folder,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Ban,
  IndianRupee,
  ChevronDown,
  Plus,
  Eye,
  MoreVertical,
  MapPin
} from "lucide-react";
import { projects, projectsKpis } from "@/lib/mockData";

export default function ProjectsPage() {
  const rows = projects;

  return (
    <AppShell>
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Projects" }]}
        title="Projects"
        subtitle="View, search and monitor all MPLADS projects in your constituency"
        right={
          <>
            <ExportButton label="Export" />
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg px-3.5 py-2 hover:bg-blue-700">
              <Plus size={15} /> Add New Project
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
              Apr 2021 – Dec 2024
              <ChevronDown size={14} />
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <KpiCard
          icon={Folder}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Projects"
          value={String(projectsKpis.totalProjects)}
          subValue={`↑ ${projectsKpis.totalProjectsYoY}% vs. last year`}
          subValueColor="text-emerald-600"
          trend
        />
        <KpiCard
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Completed"
          value={String(projectsKpis.completed)}
          subValue={`(${projectsKpis.completedPct}%)`}
          subValueColor="text-emerald-600"
        />
        <KpiCard
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="In Progress"
          value={String(projectsKpis.inProgress)}
          subValue={`(${projectsKpis.inProgressPct}%)`}
          subValueColor="text-blue-600"
        />
        <KpiCard
          icon={AlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Delayed"
          value={String(projectsKpis.delayed)}
          subValue={`(${projectsKpis.delayedPct}%)`}
          subValueColor="text-red-600"
        />
        <KpiCard
          icon={Ban}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Not Started"
          value={String(projectsKpis.notStarted)}
          subValue={`(${projectsKpis.notStartedPct}%)`}
          subValueColor="text-amber-600"
        />
        <KpiCard
          icon={IndianRupee}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Total Allocated"
          value={`₹ ${projectsKpis.totalAllocatedCr} Cr`}
          subValue={`Utilized: ${projectsKpis.utilizedPct}% (₹${projectsKpis.utilizedCr} Cr)`}
        />
      </div>

      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <input
          placeholder="Search by project name, location..."
          className="flex-1 min-w-[220px] text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {["Constituency: All", "District: All", "Agency: All", "Status: All", "Year: All"].map((f) => (
          <button
            key={f}
            className="inline-flex items-center gap-1 text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            {f}
            <ChevronDown size={12} />
          </button>
        ))}
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg px-3 py-2">
          More Filters
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-xs text-slate-500">
            Showing 1-{rows.length} of {projectsKpis.totalProjects} projects
          </p>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
            Sort by: AI Risk Score (High to Low)
            <ChevronDown size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="py-2.5 px-4 font-medium">#</th>
                <th className="py-2.5 px-2 font-medium">Project Details</th>
                <th className="py-2.5 px-2 font-medium">Constituency / Location</th>
                <th className="py-2.5 px-2 font-medium">Agency</th>
                <th className="py-2.5 px-2 font-medium">Financial Progress</th>
                <th className="py-2.5 px-2 font-medium">Physical Progress</th>
                <th className="py-2.5 px-2 font-medium">AI Risk Score</th>
                <th className="py-2.5 px-2 font-medium">Status</th>
                <th className="py-2.5 px-2 font-medium">Predicted Delay</th>
                <th className="py-2.5 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.code}</p>
                        <span className="text-[10px] text-blue-600">{p.sector}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin size={11} className="text-slate-400" />
                      {p.constituency}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-600">{p.agency}</td>
                  <td className="py-3 px-2 w-28">
                    <ProgressBar value={p.financialProgressPct} color="bg-emerald-500" showLabel />
                  </td>
                  <td className="py-3 px-2 w-28">
                    <ProgressBar value={p.physicalProgressPct} color="bg-blue-500" showLabel />
                  </td>
                  <td className="py-3 px-2">
                    <Badge color={riskBadgeColor(p.aiScore)}>{p.aiScore}</Badge>
                  </td>
                  <td className="py-3 px-2">
                    <Badge color={statusBadgeColor(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-slate-600">
                    {p.predictedDelayDays > 0 ? `${p.predictedDelayDays} days` : "On time"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <a href={`/projects/${p.id}`}>
                        <Eye size={14} className="hover:text-blue-600" />
                      </a>
                      <MoreVertical size={14} className="hover:text-slate-600 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <label className="text-xs text-slate-500 flex items-center gap-1.5">
            Show
            <select className="border border-slate-200 rounded-md px-1.5 py-0.5 text-xs">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            entries
          </label>
          <div className="flex items-center gap-1 text-xs">
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-400">‹</button>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-semibold">1</button>
            {[2, 3, 4, 5].map((n) => (
              <button key={n} className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
                {n}
              </button>
            ))}
            <span className="text-slate-400">…</span>
            <button className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">19</button>
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-600">›</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
