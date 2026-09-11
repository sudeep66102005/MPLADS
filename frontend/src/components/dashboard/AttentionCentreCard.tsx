import Link from "next/link";
import { AlertTriangle, ArrowRight, ChevronRight, Info, TrendingDown, Building2 } from "lucide-react";
import { classNames } from "@/lib/format";
import { attentionCentreItems, attentionCentreNewCount } from "@/lib/mockData";

const toneStyles = {
  red: { bg: "bg-red-500/15", text: "text-red-400", Icon: AlertTriangle },
  amber: { bg: "bg-amber-500/15", text: "text-amber-400", Icon: TrendingDown },
  orange: { bg: "bg-orange-500/15", text: "text-orange-400", Icon: Building2 },
  blue: { bg: "bg-blue-500/15", text: "text-blue-400", Icon: Info }
} as const;

export function AttentionCentreCard() {
  return (
    <section className="rounded-xl bg-navy-950 p-4 text-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white">MP Attention Centre</h2>
        <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5">
          {attentionCentreNewCount} New
        </span>
      </div>

      <ul className="space-y-1 mb-3.5">
        {attentionCentreItems.map((item) => {
          const tone = toneStyles[item.tone];
          const { Icon } = tone;
          return (
            <li key={item.id}>
              <button className="w-full flex items-center gap-2.5 py-1.5 text-left rounded-lg hover:bg-white/5 -mx-1 px-1">
                <span
                  className={classNames(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    tone.bg
                  )}
                >
                  <Icon size={12} className={tone.text} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11.5px] font-medium text-slate-100 truncate">
                    {item.title}
                  </span>
                  {item.detail ? (
                    <span className="block text-[10px] text-slate-400 truncate">{item.detail}</span>
                  ) : null}
                </span>
                <ChevronRight size={14} className="text-slate-500 shrink-0" />
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
