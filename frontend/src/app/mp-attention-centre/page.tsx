import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, IndianRupee, Building2, MapPinOff, ArrowRight } from "lucide-react";
import { attentionSummary, projects, agencyContribution, wardGaps } from "@/lib/mockData";

export default function MpAttentionCentrePage() {
  const delayed = projects.filter((p) => p.delayProbabilityPct > 70).slice(0, 3);
  const weakestAgency = [...agencyContribution].sort((a, b) => a.aiScore - b.aiScore)[0];

  return (
    <AppShell>
      <PageHeader
        title="MP Attention Centre"
        subtitle="Everything that actually needs your attention today, in one place — so nothing important is missed inside a long list of routine, healthy projects."
      />

      <div className="card p-4 mb-5 bg-blue-50/60 border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-blue-700" />
          <p className="text-sm font-semibold text-blue-800">Needs Attention</p>
        </div>
        <p className="text-xs text-blue-700">
          {attentionSummary.likelyDelayed} projects likely to be delayed · {attentionSummary.financialAnomalies}{" "}
          financial anomalies · {attentionSummary.underperformingAgencies} underperforming agency ·{" "}
          {attentionSummary.underservedAreas} underserved areas identified
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="text-sm font-semibold text-slate-800">Projects Likely to be Delayed</p>
          </div>
          <div className="space-y-2.5">
            {delayed.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {p.constituency} · Predicted delay: {p.predictedDelayDays} days
                  </p>
                </div>
                <a href={`/projects/${p.id}`} className="text-blue-600">
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <IndianRupee size={16} className="text-amber-500" />
            <p className="text-sm font-semibold text-slate-800">Financial Anomalies</p>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Badge color="red">!</Badge>
              <p className="text-xs text-slate-600">
                Spending increased significantly while reported physical progress remained unchanged on{" "}
                <span className="font-semibold">Construction of Community Hall</span>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge color="amber">!</Badge>
              <p className="text-xs text-slate-600">
                Unusual cost variation detected on <span className="font-semibold">Solar Street Lighting</span> —
                material cost 35% higher than similar projects.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-purple-500" />
            <p className="text-sm font-semibold text-slate-800">Underperforming Agency</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">{weakestAgency.name}</p>
              <p className="text-[11px] text-slate-500">
                AI Score {weakestAgency.aiScore}/100 · {weakestAgency.stalledProjects} stalled projects · Avg. delay{" "}
                {weakestAgency.avgDelayDays} days
              </p>
            </div>
            <a href="/agency-performance" className="text-blue-600">
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPinOff size={16} className="text-slate-500" />
            <p className="text-sm font-semibold text-slate-800">Underserved Areas</p>
          </div>
          <div className="space-y-2">
            {wardGaps.slice(0, 4).map((w) => (
              <div key={w.rank} className="flex items-center justify-between">
                <p className="text-xs text-slate-700">
                  {w.area} <span className="text-slate-400">({w.block})</span>
                </p>
                <Badge color={w.needLevel === "High" ? "red" : w.needLevel === "Medium" ? "amber" : "emerald"}>
                  {w.gapSector}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
