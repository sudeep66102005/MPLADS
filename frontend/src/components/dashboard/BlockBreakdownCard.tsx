import Link from "next/link";
import { blockBreakdown, statusDistribution } from "@/lib/mockData";

/**
 * Stands in for the "Project Locations" map on the dashboard.
 *
 * Answers the same question the map was there to answer — *where* are the
 * projects and what shape are they in — as a block-wise stacked breakdown,
 * with no tile provider or map SDK involved. The interactive Leaflet map is
 * still available on /map and /constituency-insights.
 */
export function BlockBreakdownCard() {
  const segments = [
    { key: "completed", color: "#22c55e" },
    { key: "inProgress", color: "#3b82f6" },
    { key: "delayed", color: "#ef4444" },
    { key: "notStarted", color: "#f59e0b" }
  ] as const;

  return (
    <section className="card p-4 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-bold text-slate-800">Projects by Block</h2>
        <Link href="/projects" className="link-muted">
          View All →
        </Link>
      </div>
      <p className="text-[11px] text-slate-400 mb-3">
        Distribution across constituency blocks
      </p>

      <ul className="space-y-2.5 flex-1">
        {blockBreakdown.map((row) => (
          <li key={row.block}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11.5px] font-medium text-slate-700">{row.block}</span>
              <span className="text-[11px] font-semibold text-slate-500">{row.total}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
              {segments.map((segment) => {
                const value = row[segment.key];
                const widthPct = (value / row.total) * 100;
                return (
                  <div
                    key={segment.key}
                    style={{ width: `${widthPct}%`, backgroundColor: segment.color }}
                    title={`${value} ${segment.key}`}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-slate-100">
        {statusDistribution.map((status) => (
          <span key={status.label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            {status.label}
          </span>
        ))}
      </div>
    </section>
  );
}
