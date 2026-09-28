interface StatusDonutChartProps {
  data: { label: string; value: number; pct: number; color: string }[];
  total: number;
}

export function StatusDonutChart({ data, total }: StatusDonutChartProps) {
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;

  return (
    <div className="relative h-[168px] w-[168px] shrink-0 mx-auto sm:mx-0" aria-label={`${total} projects by status`}>
      <svg viewBox="0 0 168 168" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="84" cy="84" r={radius} fill="none" stroke="#eef2f7" strokeWidth="26" />
        {data.map((entry) => {
          const segment = (entry.value / total) * circumference;
          const offset = consumed;
          consumed += segment;
          return (
            <circle
              key={entry.label}
              cx="84"
              cy="84"
              r={radius}
              fill="none"
              stroke={entry.color}
              strokeWidth="26"
              strokeDasharray={`${Math.max(segment - 2, 0)} ${circumference}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold leading-none text-slate-900">{total}</span>
        <span className="text-[11px] text-slate-400 mt-0.5">Projects</span>
      </div>
    </div>
  );
}
