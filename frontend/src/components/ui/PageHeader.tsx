import Link from "next/link";
import { classNames } from "@/lib/format";
import { Download } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Breadcrumb[];
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
      <div>
        {breadcrumbs ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            {breadcrumbs.map((bc, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-blue-600">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-medium">{bc.label}</span>
                )}
                {idx < breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </div>
        ) : null}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function ExportButton({ label = "Export" }: { label?: string }) {
  return (
    <button
      className={classNames(
        "inline-flex items-center gap-2 text-sm font-medium border border-slate-200 bg-white rounded-lg px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
      )}
    >
      <Download size={15} />
      {label}
    </button>
  );
}
