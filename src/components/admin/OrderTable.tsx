"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/store/OrderStatusBadge";
import { Table, Td, Th } from "./ui";

export type OrderRow = {
  id: string;
  orderNumber: string;
  date: string;
  name: string;
  place: string;
  paymentStatus: PaymentStatus;
  method: string;
  status: OrderStatus;
  items: number;
  total: number;
};

/** Orders list with multi-select to move many orders forward at once. */
export default function OrderTable({ rows }: { rows: OrderRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const all = rows.length > 0 && selected.size === rows.length;

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  const move = async (status: "PROCESSING" | "DELIVERED") => {
    setBusy(true);
    try {
      const res = await api<{ updated: number; skipped: Array<{ orderNumber: string; reason: string }> }>("/api/admin/orders/bulk", { body: { ids: [...selected], status, notifyCustomer: notify } });
      toast(`${res.updated} ${res.updated === 1 ? "order" : "orders"} updated${res.skipped.length ? ` · ${res.skipped.length} skipped (${res.skipped[0].orderNumber}: ${res.skipped[0].reason})` : ""}`, res.skipped.length && !res.updated ? "error" : undefined);
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 bg-zinc-900 px-4 py-2.5 text-sm text-white dark:bg-white dark:text-zinc-900">
          <button onClick={() => setSelected(new Set())} className="rounded p-1 hover:bg-white/10" aria-label="Clear selection"><X size={16} /></button>
          <span className="mr-2 font-semibold">{selected.size} selected</span>
          {busy && <Loader2 size={16} className="animate-spin" />}
          <button disabled={busy} onClick={() => move("PROCESSING")} className="h-8 rounded-md border border-white/20 px-3 font-medium hover:bg-white/10 disabled:opacity-50 dark:border-zinc-300">Mark as packing</button>
          <button disabled={busy} onClick={() => move("DELIVERED")} className="h-8 rounded-md border border-white/20 px-3 font-medium hover:bg-white/10 disabled:opacity-50 dark:border-zinc-300">Mark as delivered</button>
          <label className="ml-auto flex items-center gap-2 text-xs">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-white" /> Email customers
          </label>
        </div>
      )}
      <Table>
        <thead>
          <tr>
            <Th className="w-10">
              <input type="checkbox" checked={all} onChange={() => setSelected(all ? new Set() : new Set(rows.map((r) => r.id)))} aria-label="Select all" className="h-4 w-4 accent-zinc-900" />
            </Th>
            <Th>Order</Th>
            <Th>Date</Th>
            <Th>Customer</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th className="text-right">Items</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className={cn("hover:bg-zinc-50 dark:hover:bg-zinc-800/40", selected.has(o.id) && "bg-zinc-50 dark:bg-zinc-800/60")}>
              <Td><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} aria-label={`Select ${o.orderNumber}`} className="h-4 w-4 accent-zinc-900" /></Td>
              <Td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></Td>
              <Td className="whitespace-nowrap text-zinc-500">{o.date}</Td>
              <Td>
                <p>{o.name}</p>
                <p className="text-xs text-zinc-500">{o.place}</p>
              </Td>
              <Td>
                <PaymentStatusBadge status={o.paymentStatus} />
                <p className="mt-1 text-xs text-zinc-500">{o.method}</p>
              </Td>
              <Td><OrderStatusBadge status={o.status} /></Td>
              <Td className="text-right tabular-nums">{o.items}</Td>
              <Td className="text-right font-medium tabular-nums">{formatINR(o.total)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
