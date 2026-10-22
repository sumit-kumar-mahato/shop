"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckSquare, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";
import { formatINR } from "@/lib/money";
import { PRODUCT_FLAGS, type ProductFlag } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Table, Td, Th } from "./ui";
import ProductRowActions from "./ProductRowActions";

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  image: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  stock: number;
  variantCount: number;
  category: string | null;
  price: number;
  salesCount: number;
  flags: ProductFlag[];
};

/** Products list with multi-select and bulk actions (publish, archive, homepage placement). */
export default function ProductTable({ rows, lowStockAt }: { rows: ProductRow[]; lowStockAt: number }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const all = rows.length > 0 && selected.size === rows.length;

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  const run = async (body: Record<string, unknown>, message: string) => {
    setBusy(true);
    try {
      const res = await api<{ count: number }>("/api/admin/products/bulk", { body: { ...body, ids: [...selected] } });
      toast(`${message} — ${res.count} ${res.count === 1 ? "product" : "products"}`);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-zinc-900 px-4 py-2.5 text-sm text-white dark:border-zinc-700 dark:bg-white dark:text-zinc-900">
          <button onClick={() => setSelected(new Set())} className="rounded p-1 hover:bg-white/10 dark:hover:bg-zinc-200" aria-label="Clear selection"><X size={16} /></button>
          <span className="mr-2 font-semibold">{selected.size} selected</span>
          {busy && <Loader2 size={16} className="animate-spin" />}
          <BulkButton disabled={busy} onClick={() => run({ action: "status", status: "ACTIVE" }, "Published")}>Publish</BulkButton>
          <BulkButton disabled={busy} onClick={() => run({ action: "status", status: "DRAFT" }, "Moved to drafts")}>Unpublish</BulkButton>
          <BulkButton disabled={busy} onClick={() => run({ action: "status", status: "ARCHIVED" }, "Archived")}>Archive</BulkButton>
          <select
            disabled={busy}
            value=""
            onChange={(e) => {
              const [flag, v] = e.target.value.split(":") as [ProductFlag, string];
              if (flag) void run({ action: "flag", flag, value: v === "1" }, `${v === "1" ? "Added to" : "Removed from"} ${PRODUCT_FLAGS[flag]}`);
            }}
            className="h-8 rounded-md border border-white/20 bg-transparent px-2 text-sm dark:border-zinc-300"
            aria-label="Homepage placement"
          >
            <option value="" className="text-zinc-900">Homepage placement…</option>
            {(Object.keys(PRODUCT_FLAGS) as ProductFlag[]).map((f) => (
              <optgroup key={f} label={PRODUCT_FLAGS[f]} className="text-zinc-900">
                <option value={`${f}:1`}>Add to “{PRODUCT_FLAGS[f]}”</option>
                <option value={`${f}:0`}>Remove from “{PRODUCT_FLAGS[f]}”</option>
              </optgroup>
            ))}
          </select>
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <Th className="w-10">
              <input type="checkbox" checked={all} onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))} aria-label="Select all" className="h-4 w-4 accent-zinc-900" />
            </Th>
            <Th>Product</Th>
            <Th>Status</Th>
            <Th>Stock</Th>
            <Th>Category</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Sold</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className={cn("hover:bg-zinc-50 dark:hover:bg-zinc-800/40", selected.has(p.id) && "bg-zinc-50 dark:bg-zinc-800/60")}>
              <Td>
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.title}`} className="h-4 w-4 accent-zinc-900" />
              </Td>
              <Td>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                  <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</div>
                  <span className="min-w-0">
                    <span className="block font-medium hover:underline">{p.title}</span>
                    {p.flags.length > 0 && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {p.flags.map((f) => (
                          <span key={f} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{PRODUCT_FLAGS[f]}</span>
                        ))}
                      </span>
                    )}
                  </span>
                </Link>
              </Td>
              <Td>
                <Badge tone={p.status === "ACTIVE" ? "green" : p.status === "DRAFT" ? "amber" : "neutral"}>{p.status.toLowerCase()}</Badge>
              </Td>
              <Td className="whitespace-nowrap">
                <span className={p.stock === 0 ? "font-medium text-red-600" : p.stock <= lowStockAt ? "font-medium text-amber-600" : ""}>{p.stock}</span>
                <span className="text-zinc-500"> · {p.variantCount} {p.variantCount === 1 ? "variant" : "variants"}</span>
              </Td>
              <Td className="text-zinc-500">{p.category ?? "—"}</Td>
              <Td className="text-right tabular-nums">{formatINR(p.price)}</Td>
              <Td className="text-right tabular-nums text-zinc-500">{p.salesCount}</Td>
              <Td className="text-right">
                <ProductRowActions id={p.id} slug={p.slug} status={p.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
      {selected.size === 0 && rows.length > 1 && (
        <p className="flex items-center gap-1.5 border-t border-zinc-100 px-5 py-2.5 text-xs text-zinc-500 dark:border-zinc-800">
          <CheckSquare size={13} /> Tick several products to publish, archive or place them on the homepage in one go.
        </p>
      )}
    </div>
  );
}

function BulkButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className="h-8 rounded-md border border-white/20 px-3 font-medium hover:bg-white/10 disabled:opacity-50 dark:border-zinc-300 dark:hover:bg-zinc-100">
      {children}
    </button>
  );
}
