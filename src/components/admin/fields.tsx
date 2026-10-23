"use client";

// Form building blocks shared by the website editors in the admin panel.
import React, { useId, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2, X } from "lucide-react";
import { ICONS, type IconName } from "@/lib/settings-schema";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type LinkSuggestion = { label: string; href: string };

/** On/off switch with a label and optional help text. */
export function Toggle({ label, hint, checked, onChange, disabled }: { label: React.ReactNode; hint?: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-50")}>
      <label htmlFor={id} className="cursor-pointer text-sm">
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
          checked ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-700",
        )}
      >
        <span className={cn("inline-block h-5 w-5 rounded-full bg-white shadow transition-transform dark:bg-zinc-900", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

/** A row of mutually exclusive options shown as buttons. */
export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: React.ReactNode }>; className?: string }) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            value === o.value ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Large selectable cards (e.g. fonts, shapes) with a visual sample. */
export function ChoiceCards<T extends string>({ value, onChange, options, columns = 2 }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string; sample: React.ReactNode }>; columns?: 2 | 3 | 4 }) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4")} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border p-3 text-left transition-all",
            value === o.value ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-white dark:ring-white" : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-500",
          )}
        >
          <div className="mb-2">{o.sample}</div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{o.label}</p>
        </button>
      ))}
    </div>
  );
}

const SWATCHES = ["#c5a880", "#b08d57", "#8a5a44", "#9f1239", "#be123c", "#7c3aed", "#1d4ed8", "#0f766e", "#15803d", "#ca8a04", "#ea580c", "#18181b"];

export function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-md border border-zinc-200 bg-transparent dark:border-zinc-700" aria-label="Pick colour" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-32 rounded-md border border-zinc-200 bg-white px-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950" aria-label="Hex colour" />
      </div>
      <div className="flex flex-wrap gap-2">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn("h-7 w-7 rounded-full ring-offset-2 transition-transform hover:scale-110 dark:ring-offset-zinc-900", value.toLowerCase() === c && "ring-2 ring-zinc-900 dark:ring-white")}
            style={{ background: c }}
            aria-label={`Use ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

export function IconPicker({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex h-10 items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 dark:border-zinc-700" aria-label="Choose icon" aria-expanded={open}>
        <Icon name={value} size={18} />
        <ChevronDown size={14} className="text-zinc-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 grid w-56 grid-cols-6 gap-1 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(i);
                setOpen(false);
              }}
              className={cn("flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800", i === value && "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900")}
              title={i}
            >
              <Icon name={i} size={16} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const inputCls = "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-white dark:focus:ring-white";

/** Text input for a link, with suggestions for the store's own pages and categories. */
export function LinkInput({ value, onChange, suggestions, placeholder = "/shop", ...rest }: { value: string; onChange: (v: string) => void; suggestions: LinkSuggestion[]; placeholder?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const id = useId();
  return (
    <>
      <input list={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} {...rest} />
      <datalist id={id}>
        {suggestions.map((s) => (
          <option key={s.href} value={s.href}>{s.label}</option>
        ))}
      </datalist>
    </>
  );
}

/** Range slider with the current value shown. */
export function Slider({ value, onChange, min, max, step = 1, suffix = "" }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-zinc-900 dark:accent-white" />
      <span className="w-14 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
        {value}
        {suffix}
      </span>
    </div>
  );
}

/** Collapsible card used to group fields inside an editor. */
export function EditorSection({ title, description, icon, children, defaultOpen = true, actions }: { title: string; description?: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; actions?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 px-5 py-4">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-3 text-left" aria-expanded={open}>
          {icon && <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{icon}</span>}
          <span className="flex-1">
            <span className="block font-semibold">{title}</span>
            {description && <span className="block text-sm text-zinc-500 dark:text-zinc-400">{description}</span>}
          </span>
          <ChevronDown size={18} className={cn("text-zinc-400 transition-transform", open && "rotate-180")} />
        </button>
        {actions}
      </div>
      {open && <div className="space-y-5 border-t border-zinc-100 px-5 py-5 dark:border-zinc-800">{children}</div>}
    </section>
  );
}

/**
 * Editable list with move up/down, duplicate and delete for each item.
 * `render` draws the fields for one item; `create` makes a new item for "Add".
 */
export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  max,
  addLabel = "Add",
  itemLabel,
  empty,
  compact,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  create: () => T;
  max?: number;
  addLabel?: string;
  itemLabel?: (item: T, index: number) => React.ReactNode;
  empty?: React.ReactNode;
  compact?: boolean;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const next = [...items];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };
  const full = max !== undefined && items.length >= max;
  return (
    <div className="space-y-3">
      {items.length === 0 && empty && <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className={cn("rounded-lg border border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-950/40", compact ? "p-2.5" : "p-4")}>
          <div className={cn("flex items-center gap-2", !compact && "mb-3")}>
            {itemLabel && <p className="flex-1 truncate text-sm font-semibold">{itemLabel(item, i)}</p>}
            {compact && <div className="min-w-0 flex-1">{render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}</div>}
            <div className="ml-auto flex flex-shrink-0 gap-0.5">
              <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp size={15} /></IconBtn>
              <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown size={15} /></IconBtn>
              {!compact && <IconBtn label="Duplicate" onClick={() => onChange([...items.slice(0, i + 1), structuredClone(item), ...items.slice(i + 1)])} disabled={full}><Copy size={15} /></IconBtn>}
              <IconBtn label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} danger><Trash2 size={15} /></IconBtn>
            </div>
          </div>
          {!compact && render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      {!full && (
        <button type="button" onClick={() => onChange([...items, create()])} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-white dark:hover:text-white">
          <Plus size={15} /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("rounded-md p-1.5 transition-colors disabled:opacity-30", danger ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white")}
    >
      {children}
    </button>
  );
}

/** List of short phrases edited as removable chips: type and press Enter (or comma) to add. */
export function TagInput({ value, onChange, placeholder, max = 20 }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; max?: number }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const items = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    for (const item of items) if (!next.some((x) => x.toLowerCase() === item.toLowerCase()) && next.length < max) next.push(item);
    onChange(next);
    setDraft("");
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-zinc-200 bg-white p-1.5 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:border-white dark:focus-within:ring-white">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1 text-sm dark:bg-zinc-800">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white" aria-label={`Remove ${tag}`}>
            <X size={13} />
          </button>
        </span>
      ))}
      {value.length < max && (
        <input
          value={draft}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "Add more…" : placeholder}
          className="h-8 min-w-[140px] flex-1 bg-transparent px-1.5 text-sm outline-none"
        />
      )}
    </div>
  );
}
