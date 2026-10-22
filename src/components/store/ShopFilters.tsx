"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, SlidersHorizontal, X } from "lucide-react";
import type { ShopParams } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Facets = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  maxPrice: number;
  categories: Array<{ id: string; name: string; slug: string }>;
};

const GENDERS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

export default function ShopFilters({ facets, params, activeCount }: { facets: Facets; params: ShopParams; activeCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(params.min ?? "");
  const [max, setMax] = useState(params.max ?? "");

  useEffect(() => {
    setMin(params.min ?? "");
    setMax(params.max ?? "");
  }, [params.min, params.max]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    next.delete("search");
    next.delete("priceMax");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const toggleInList = (key: "size" | "color" | "gender", value: string) => {
    const current = (params[key] ?? "").split(",").filter(Boolean);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next.join(",") || null });
  };

  const inList = (key: "size" | "color" | "gender", value: string) => (params[key] ?? "").toLowerCase().split(",").includes(value.toLowerCase());

  const content = (
    <div className={cn("space-y-8", pending && "opacity-60 transition-opacity")}>
      {activeCount > 0 && (
        <button onClick={() => startTransition(() => router.push(pathname + (params.q ? `?q=${encodeURIComponent(params.q)}` : "")))} className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline">
          <X size={14} /> Clear filters ({activeCount})
        </button>
      )}

      <FilterGroup title="Category">
        <ul className="space-y-1.5">
          <li>
            <RadioRow active={!params.category} onClick={() => update({ category: null })}>All categories</RadioRow>
          </li>
          {facets.categories.map((c) => (
            <li key={c.id}>
              <RadioRow active={params.category === c.slug} onClick={() => update({ category: params.category === c.slug ? null : c.slug })}>
                {c.name}
              </RadioRow>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="For">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip key={g.value} active={inList("gender", g.value)} onClick={() => toggleInList("gender", g.value)}>
              {g.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <Chip key={s} active={inList("size", s)} onClick={() => toggleInList("size", s)}>
                {s}
              </Chip>
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour">
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => {
              const active = inList("color", c.name);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleInList("color", c.name)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={active}
                  className={cn("relative h-8 w-8 rounded-full border transition-all", active ? "ring-2 ring-brand ring-offset-2 dark:ring-offset-zinc-950" : "border-luxury-300 dark:border-zinc-600")}
                  style={{ backgroundColor: c.hex ?? "#ccc" }}
                >
                  {active && <Check size={14} className="absolute inset-0 m-auto mix-blend-difference text-white" />}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Price (₹)">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min || null, max: max || null });
          }}
        >
          <input type="number" min={0} inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" aria-label="Minimum price" className="h-10 w-full rounded-sm border border-luxury-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <span className="text-luxury-400">–</span>
          <input type="number" min={0} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder={facets.maxPrice ? String(facets.maxPrice) : "Max"} aria-label="Maximum price" className="h-10 w-full rounded-sm border border-luxury-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <button type="submit" className="h-10 rounded-sm bg-luxury-900 px-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">Go</button>
        </form>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-2">
          <Toggle checked={params.instock === "1"} onChange={(v) => update({ instock: v ? "1" : null })} label="In stock only" />
          <Toggle checked={params.sale === "1"} onChange={(v) => update({ sale: v ? "1" : null })} label="On sale" />
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block" aria-label="Filters">
        {content}
      </aside>
      <div className="lg:hidden">
        <button onClick={() => setOpen(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-luxury-300 text-sm font-semibold dark:border-zinc-700">
          <SlidersHorizontal size={16} /> Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {open && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm animate-slide-in-left flex-col bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-luxury-200 px-5 py-4 dark:border-zinc-800">
                <h2 className="font-serif text-lg">Filters</h2>
                <button onClick={() => setOpen(false)} aria-label="Close filters" className="p-2">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{content}</div>
              <div className="border-t border-luxury-200 p-4 dark:border-zinc-800">
                <button onClick={() => setOpen(false)} className="h-11 w-full rounded-sm bg-luxury-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-luxury-500">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-w-[44px] rounded-sm border px-3 py-1.5 text-sm transition-colors",
        active ? "border-luxury-900 bg-luxury-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-luxury-200 hover:border-luxury-500 dark:border-zinc-700",
      )}
    >
      {children}
    </button>
  );
}

function RadioRow({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("text-left text-sm transition-colors", active ? "font-semibold text-luxury-900 dark:text-white" : "text-luxury-600 hover:text-luxury-900 dark:text-zinc-400 dark:hover:text-white")}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[rgb(var(--brand-rgb))]" />
      {label}
    </label>
  );
}
