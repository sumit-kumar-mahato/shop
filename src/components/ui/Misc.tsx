import React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue" | "brand" | "purple";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-luxury-100 text-luxury-700 dark:bg-zinc-800 dark:text-zinc-300",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-900",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-900",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:ring-purple-900",
  brand: "bg-brand/15 text-luxury-900 dark:text-brand",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-sm border border-luxury-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-900", className)}>{children}</div>;
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-sm border border-dashed border-luxury-300 px-6 py-14 text-center dark:border-zinc-700">
      {icon && <div className="mb-4 text-luxury-400 dark:text-zinc-600">{icon}</div>}
      <h3 className="font-serif text-xl text-luxury-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-luxury-500 dark:text-zinc-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, className, align = "center" }: { eyebrow?: string; title: string; className?: string; align?: "center" | "left" }) {
  return (
    <div className={cn("mb-10 space-y-2", align === "center" && "text-center", className)}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>}
      <h2 className="font-serif text-3xl text-luxury-900 dark:text-white sm:text-4xl">{title}</h2>
      {align === "center" && <div className="mx-auto mt-3 h-px w-12 bg-brand" />}
    </div>
  );
}

export function Stars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-amber-500", className)} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`star-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                <stop offset={`${fill * 100}%`} stopColor="currentColor" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${i}-${Math.round(fill * 100)})`}
              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.5 6.6-.8z"
            />
          </svg>
        );
      })}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent", className)} aria-label="Loading" />;
}
