import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6">
      {back && (
        <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          <ChevronLeft size={14} /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, description, actions, children, className, padded = true }: { title?: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn("rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60", className)}>{children}</th>;
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("border-b border-zinc-100 px-4 py-3 align-middle dark:border-zinc-800", className)}>{children}</td>;
}

export function AdminPagination({ page, pageCount, baseHref }: { page: number; pageCount: number; baseHref: (p: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-sm dark:border-zinc-800">
      <span className="text-zinc-500">
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={baseHref(page - 1)} className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <ChevronLeft size={14} /> Previous
          </Link>
        )}
        {page < pageCount && (
          <Link href={baseHref(page + 1)} className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Next <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

/** Builds a URL for a list page while keeping the current filters. */
export function withParams(path: string, params: Record<string, string | undefined>, changes: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...params, ...changes })) {
    if (v !== undefined && v !== "" && !(k === "page" && String(v) === "1")) sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export function StatCard({ label, value, hint, trend, icon }: { label: string; value: string; hint?: string; trend?: number | null; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        {label}
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {trend != null && Number.isFinite(trend) && (
          <span className={cn("mr-1 font-semibold", trend >= 0 ? "text-green-600" : "text-red-600")}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(0)}%
          </span>
        )}
        {hint}
      </p>
    </div>
  );
}
