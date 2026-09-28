import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronRight, Info, TrendingDown, Building2 } from "lucide-react";
import { classNames } from "@/lib/format";
import { attentionCentreItems, attentionCentreNewCount } from "@/lib/mockData";

const toneStyles = {
  red: { bg: "bg-red-50", text: "text-red-500", Icon: AlertTriangle },
  amber: { bg: "bg-amber-50", text: "text-amber-500", Icon: TrendingDown },
  orange: { bg: "bg-orange-50", text: "text-orange-500", Icon: Building2 },
  blue: { bg: "bg-blue-50", text: "text-blue-500", Icon: Info }
} as const;

export function AttentionCentreCard() {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800">MP Attention Centre</h2>
        <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
          {attentionCentreNewCount} New
        </span>
      </div>

      <ul className="mb-3.5 divide-y divide-slate-100">
        {attentionCentreItems.map((item) => {
          const tone = toneStyles[item.tone];
          const { Icon } = tone;
          return (
            <li key={item.id}>
              <button className="-mx-1 flex w-full items-center gap-2.5 rounded-lg px-1 py-2 text-left hover:bg-slate-50">
                <span
                  className={classNames(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    tone.bg
                  )}
                >
                  <Icon size={12} className={tone.text} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium text-slate-800">
                    {item.title}
                  </span>
                  {item.detail ? (
                    <span className="block truncate text-[10px] text-slate-500">{item.detail}</span>
                  ) : null}
                </span>
                <ChevronRight size={14} className="shrink-0 text-slate-300" />
              </button>
            </li>
          );
        })}
      </ul>

      <Link
        href="/mp-attention-centre"
        className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 transition-colors"
      >
        View Detailed Analysis <ArrowRight size={13} />
      </Link>
    </section>
  );
}
