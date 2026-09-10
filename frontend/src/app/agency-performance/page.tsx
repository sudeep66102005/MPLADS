import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Building2 } from "lucide-react";
import { agencyContribution } from "@/lib/mockData";

export default function AgencyPerformancePage() {
  return (
    <AppShell>
      <PageHeader
        title="Agency Performance"
        subtitle="Roll-up of every implementing agency into one accountability view — completion rate, delay, cost variation and update consistency"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agencyContribution.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 size={16} className="text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">{a.name}</p>
              </div>
              <Badge color={a.aiScore >= 65 ? "emerald" : a.aiScore >= 50 ? "amber" : "red"}>
                {a.aiScore} / 100
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-center">
              <div>
                <p className="text-[10px] text-slate-400">Projects</p>
                <p className="text-sm font-bold text-slate-800">{a.projectsCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Avg. Delay</p>
                <p className="text-sm font-bold text-slate-800">{a.avgDelayDays} days</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Cost Variation</p>
                <p className="text-sm font-bold text-amber-600">+{a.costVariationPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Stalled Projects</p>
                <p className="text-sm font-bold text-red-600">{a.stalledProjects}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-1">Completion Rate</p>
            <ProgressBar value={a.completionRatePct} color="bg-emerald-500" showLabel />

            <p className="text-[11px] text-slate-500 mb-1 mt-2">Update Consistency</p>
            <ProgressBar value={a.updateConsistencyPct} color="bg-blue-500" showLabel />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
