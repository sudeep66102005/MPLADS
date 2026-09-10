import { classNames } from "@/lib/format";

interface ProgressBarProps {
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  color = "bg-blue-600",
  trackColor = "bg-slate-100",
  height = 6,
  showLabel = false
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={classNames("flex-1 rounded-full overflow-hidden", trackColor)} style={{ height }}>
        <div className={classNames("h-full rounded-full", color)} style={{ width: `${clamped}%` }} />
      </div>
      {showLabel ? <span className="text-xs font-semibold text-slate-600 w-10 text-right">{clamped}%</span> : null}
    </div>
  );
}
