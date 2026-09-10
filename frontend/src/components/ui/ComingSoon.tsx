import type { LucideIcon } from "lucide-react";

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
}

export function ComingSoon({ icon: Icon, title, description, bullets }: ComingSoonProps) {
  return (
    <div className="card p-10 flex flex-col items-center text-center max-w-2xl mx-auto mt-8">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Icon size={26} className="text-blue-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h2>
      <p className="text-sm text-slate-500 mb-4 leading-relaxed">{description}</p>
      {bullets ? (
        <ul className="text-left text-sm text-slate-600 space-y-1.5 w-full max-w-md">
          {bullets.map((b, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
