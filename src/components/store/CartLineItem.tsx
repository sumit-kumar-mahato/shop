"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/money";
import { errorMessage } from "@/lib/fetcher";
import type { QuoteLine } from "@/lib/types";
import { cn } from "@/lib/utils";

const ISSUE_TEXT = {
  OUT_OF_STOCK: "Out of stock — please remove",
  UNAVAILABLE: "No longer available — please remove",
  QUANTITY_REDUCED: "Only a few left — quantity adjusted",
};

export default function CartLineItem({ line, compact, onNavigate }: { line: QuoteLine; compact?: boolean; onNavigate?: () => void }) {
  const { setQuantity, remove } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const blocked = line.issue === "OUT_OF_STOCK" || line.issue === "UNAVAILABLE";

  return (
    <li className={cn("flex gap-4 py-4", busy && "opacity-60")}>
      <Link href={`/product/${line.slug}`} onClick={onNavigate} className={cn("flex-shrink-0 overflow-hidden bg-luxury-100 dark:bg-zinc-800", compact ? "h-24 w-[72px]" : "h-32 w-24")}>
        {line.image && <img src={line.image} alt={line.title} className={cn("h-full w-full object-cover", blocked && "grayscale")} />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${line.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-medium hover:text-brand">
            {line.title}
          </Link>
          <button onClick={() => run(() => remove(line.variantId))} disabled={busy} className="flex-shrink-0 p-1 text-luxury-400 hover:text-red-600" aria-label={`Remove ${line.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
        <p className="mt-0.5 text-xs text-luxury-500">
          {line.size} · {line.color}
        </p>
        {line.issue && (
          <p className={cn("mt-1 flex items-center gap-1 text-xs font-medium", blocked ? "text-red-600" : "text-amber-700 dark:text-amber-400")}>
            <AlertTriangle size={12} /> {ISSUE_TEXT[line.issue]}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {!blocked ? (
            <div className="flex h-8 items-center rounded-sm border border-luxury-200 dark:border-zinc-700">
              <button
                onClick={() => run(() => setQuantity(line.variantId, line.quantity - 1))}
                disabled={busy || line.quantity <= 1}
                className="flex h-full w-8 items-center justify-center disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">{line.quantity}</span>
              <button
                onClick={() => run(() => setQuantity(line.variantId, line.quantity + 1))}
                disabled={busy || line.quantity >= line.maxQuantity}
                className="flex h-full w-8 items-center justify-center disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <span />
          )}
          <div className="text-right">
            <p className="text-sm font-semibold">{formatINR(line.lineTotal || line.unitPrice * line.quantity)}</p>
            {line.quantity > 1 && <p className="text-xs text-luxury-500">{formatINR(line.unitPrice)} each</p>}
          </div>
        </div>
      </div>
    </li>
  );
}
