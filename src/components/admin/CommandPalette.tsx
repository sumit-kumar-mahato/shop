"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, ExternalLink, Loader2, Package, Plus, Search, ShoppingCart, User } from "lucide-react";
import { api } from "@/lib/fetcher";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";

type Results = {
  orders: Array<{ id: string; orderNumber: string; shippingName: string; total: number; status: string }>;
  products: Array<{ id: string; title: string; image: string | null; status: string }>;
  customers: Array<{ id: string; name: string; email: string }>;
};
type Item = { key: string; group: string; label: string; detail?: string; href: string; icon: React.ReactNode; external?: boolean };

const ACTIONS: Item[] = [
  { key: "new-product", group: "Actions", label: "Add a product", href: "/admin/products/new", icon: <Plus size={16} /> },
  { key: "new-coupon", group: "Actions", label: "Create a coupon", href: "/admin/coupons", icon: <Plus size={16} /> },
  { key: "new-post", group: "Actions", label: "Write a journal post", href: "/admin/blog/new", icon: <Plus size={16} /> },
  { key: "store", group: "Actions", label: "Open the store", href: "/", icon: <ExternalLink size={16} />, external: true },
];

/** Ctrl/⌘ + K: jump to any admin page, or find an order, product or customer. */
export default function CommandPalette({ open, onClose, isAdmin }: { open: boolean; onClose: () => void; isAdmin: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setResults(null);
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      api<Results>(`/api/admin/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then(setResults)
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const items = useMemo<Item[]>(() => {
    const term = q.trim().toLowerCase();
    const pages: Item[] = ADMIN_NAV.flatMap((g) => g.items)
      .filter((i) => !i.adminOnly || isAdmin)
      .filter((i) => !term || `${i.label} ${i.keywords ?? ""}`.toLowerCase().includes(term))
      .map((i) => ({ key: i.href, group: "Pages", label: i.label, href: i.href, icon: <i.icon size={16} /> }));
    const actions = ACTIONS.filter((a) => !term || a.label.toLowerCase().includes(term));
    const found: Item[] = results
      ? [
          ...results.orders.map((o) => ({ key: `o-${o.id}`, group: "Orders", label: o.orderNumber, detail: `${o.shippingName} · ${formatINR(o.total)}`, href: `/admin/orders/${o.id}`, icon: <ShoppingCart size={16} /> })),
          ...results.products.map((p) => ({
            key: `p-${p.id}`,
            group: "Products",
            label: p.title,
            detail: p.status.toLowerCase(),
            href: `/admin/products/${p.id}`,
            icon: p.image ? <img src={p.image} alt="" className="h-6 w-5 rounded object-cover" /> : <Package size={16} />,
          })),
          ...results.customers.map((c) => ({ key: `c-${c.id}`, group: "Customers", label: c.name, detail: c.email, href: `/admin/customers/${c.id}`, icon: <User size={16} /> })),
        ]
      : [];
    return [...found, ...pages, ...actions];
  }, [q, results, isAdmin]);

  useEffect(() => setActive(0), [items.length]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (item: Item) => {
    onClose();
    if (item.external) window.open(item.href, "_blank");
    else router.push(item.href);
  };

  if (!open) return null;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search the admin">
      <div className="absolute inset-0 animate-fade-in bg-zinc-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 dark:border-zinc-800">
          {loading ? <Loader2 size={18} className="animate-spin text-zinc-400" /> : <Search size={18} className="text-zinc-400" />}
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter" && items[active]) {
                e.preventDefault();
                go(items[active]);
              }
            }}
            placeholder="Search pages, orders, products, customers…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
            aria-label="Search"
          />
          <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:border-zinc-700">Esc</kbd>
        </div>
        <ul ref={listRef} className="max-h-[55vh] overflow-y-auto p-2" role="listbox">
          {items.length === 0 && <li className="p-6 text-center text-sm text-zinc-500">{loading ? "Searching…" : "Nothing found."}</li>}
          {items.map((item, i) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            return (
              <li key={item.key}>
                {header && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 first:pt-1">{header}</p>}
                <button
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm", i === active ? "bg-zinc-100 dark:bg-zinc-800" : "")}
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-zinc-500">{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    {item.detail && <span className="block truncate text-xs capitalize text-zinc-500">{item.detail}</span>}
                  </span>
                  {i === active && <CornerDownLeft size={14} className="text-zinc-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
