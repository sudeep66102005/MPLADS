import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { classNames } from "@/lib/format";
import { dashboardPriorityQueue, type QueueSeverity } from "@/lib/mockData";

// Severity is driven by the HEALTH score, which runs inversely to risk:
// a low score (32/100) is CRITICAL, a high score (78/100) is LOW risk.
const severityStyles: Record<QueueSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-emerald-100 text-emerald-700"
};

export function PriorityQueueCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800">AI Priority Queue</h2>
        <Link href="/priority-queue" className="link-muted">
          View All →
        </Link>
      </div>

      <ul className="divide-y divide-slate-100">
        {dashboardPriorityQueue.map((item) => (
          <li key={item.id}>
            <Link
              href={`/projects/${item.id}`}
              className="flex items-center gap-3 py-2.5 group -mx-1 px-1 rounded-lg hover:bg-slate-50"
            >
              <div
                className={classNames(
                  "w-[62px] shrink-0 rounded-lg py-1.5 text-center",
                  severityStyles[item.severity]
                )}
              >
                <p className="text-[9px] font-extrabold tracking-wide leading-none">{item.severity}</p>
                <p className="text-[11px] font-bold leading-none mt-1">{item.healthScore}/100</p>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{item.location}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.reason}</p>
              </div>

              <ChevronRight
                size={15}
                className="text-slate-300 shrink-0 group-hover:text-slate-500"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
