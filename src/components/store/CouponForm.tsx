"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/money";

export default function CouponForm() {
  const { quote, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const applied = quote?.coupon?.applied ? quote.coupon : null;
  const pendingMessage = quote?.coupon && !quote.coupon.applied ? quote.coupon.message : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await applyCoupon(code);
    setBusy(false);
    if (res.ok) setCode("");
    else setError(res.message ?? "Invalid coupon");
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-sm border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
        <span className="flex items-center gap-2">
          <Tag size={14} /> <strong>{applied.code}</strong> applied · you save {formatINR(applied.discount)}
        </span>
        <button onClick={() => removeCoupon()} aria-label="Remove coupon" className="p-1 hover:text-red-600">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-wider text-luxury-600 dark:text-zinc-400">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. FESTIVE10"
          maxLength={30}
          className="h-11 min-w-0 flex-1 rounded-sm border border-luxury-200 bg-white px-3 text-sm font-medium uppercase dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button type="submit" disabled={busy || !code.trim()} className="h-11 rounded-sm border border-luxury-900 px-4 text-sm font-semibold disabled:opacity-50 dark:border-zinc-300">
          {busy ? "…" : "Apply"}
        </button>
      </div>
      {(error || pendingMessage) && <p className="text-xs text-red-600" role="alert">{error || pendingMessage}</p>}
    </form>
  );
}
