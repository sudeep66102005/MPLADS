import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, MapPin, Eye } from "lucide-react";
import { projects } from "@/lib/mockData";

const priorityLabel = (score: number) => {
  if (score >= 70) return { label: "Critical", color: "red" as const };
  if (score >= 50) return { label: "High", color: "amber" as const };
  if (score >= 30) return { label: "Medium", color: "blue" as const };
  return { label: "Low", color: "emerald" as const };
};

const reason = (p: (typeof projects)[number]) => {
  if (p.financialProgressPct - p.physicalProgressPct > 30) {
    return `Money spent is high (${p.financialProgressPct}%) but reported progress is low (${p.physicalProgressPct}%).`;
  }
  if (p.delayProbabilityPct > 70) {
    return `High probability (${p.delayProbabilityPct}%) of missing the completion deadline.`;
  }
  if (p.updateConsistencyPct < 45) {
    return "No field updates for an extended period — needs a status check.";
  }
  return "Cost variation is higher than comparable projects executed by this agency.";
};

export default function PriorityQueuePage() {
  const queue = [...projects].sort((a, b) => b.aiScore - a.aiScore);

  return (
    <AppShell>
      <PageHeader
        title="AI Priority Queue"
        subtitle="Explainable, ranked list of projects that need a closer human look first — and why"
      />

      <div className="card p-4 mb-4 flex items-start gap-2 bg-blue-50/60 border-blue-100">
        <AlertTriangle size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          The AI layer never declares fraud — every entry below is a recommendation to look closer, with the
          evidence already laid out. The final call always stays with the authorized official.
        </p>
      </div>

      <div className="space-y-3">
        {queue.map((p) => {
          const priority = priorityLabel(p.aiScore);
          return (
            <div key={p.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={priority.color}>{priority.label}</Badge>
                  <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                  <span className="text-[11px] text-slate-400">{p.code}</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1.5">
                  <MapPin size={11} /> {p.constituency} · {p.agency}
                </p>
                <p className="text-xs text-slate-600 italic">&ldquo;{reason(p)}&rdquo;</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800">{p.aiScore}</p>
                  <p className="text-[10px] text-slate-400">AI Score</p>
                </div>
                <a
                  href={`/projects/${p.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700"
                >
                  <Eye size={13} /> Review
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
