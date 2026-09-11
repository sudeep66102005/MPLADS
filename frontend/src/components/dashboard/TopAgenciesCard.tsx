import Link from "next/link";
import { classNames } from "@/lib/format";
import { topAgencies } from "@/lib/mockData";

function scoreStyles(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export function TopAgenciesCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-bold text-slate-800">Top Agencies by Performance</h2>
        <Link href="/agency-performance" className="link-muted">
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="font-medium pb-1.5 pr-2">Agency</th>
              <th className="font-medium pb-1.5 px-2 text-right">Projects</th>
              <th className="font-medium pb-1.5 px-2 text-right">Completion Rate</th>
              <th className="font-medium pb-1.5 px-2 text-right">Avg. Delay</th>
              <th className="font-medium pb-1.5 pl-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {topAgencies.map((agency) => (
              <tr key={agency.name} className="border-b border-slate-50 last:border-0">
                <td className="py-2 pr-2 font-medium text-slate-700 whitespace-nowrap">{agency.name}</td>
                <td className="py-2 px-2 text-slate-500 text-right">{agency.projects}</td>
                <td className="py-2 px-2 text-slate-500 text-right">{agency.completionRatePct}%</td>
                <td className="py-2 px-2 text-slate-500 text-right whitespace-nowrap">
                  {agency.avgDelayDays} days
                </td>
                <td className="py-2 pl-2 text-right">
                  <span
                    className={classNames(
                      "inline-block rounded-md px-1.5 py-0.5 font-bold",
                      scoreStyles(agency.score)
                    )}
                  >
                    {agency.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
