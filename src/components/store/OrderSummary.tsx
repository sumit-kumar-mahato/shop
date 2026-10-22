import { formatINR } from "@/lib/money";
import type { Totals } from "@/lib/pricing";

export default function OrderSummary({ totals, couponCode, taxRate }: { totals: Totals; couponCode?: string | null; taxRate?: number }) {
  return (
    <dl className="space-y-2.5 text-sm">
      <Row label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"})`} value={formatINR(totals.subtotal)} />
      {totals.discount > 0 && <Row label={`Discount${couponCode ? ` (${couponCode})` : ""}`} value={`−${formatINR(totals.discount)}`} className="text-green-700 dark:text-green-400" />}
      <Row label="Shipping" value={totals.shippingFee === 0 ? "Free" : formatINR(totals.shippingFee)} />
      {!totals.taxIncluded && <Row label={`GST${taxRate ? ` (${taxRate}%)` : ""}`} value={formatINR(totals.tax)} />}
      <div className="flex items-baseline justify-between border-t border-luxury-200 pt-3 dark:border-zinc-700">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl font-semibold">{formatINR(totals.total)}</dd>
      </div>
      {totals.taxIncluded && totals.tax > 0 && <p className="text-right text-xs text-luxury-500">Includes {formatINR(totals.tax)} GST</p>}
    </dl>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex justify-between ${className ?? ""}`}>
      <dt className="text-luxury-600 dark:text-zinc-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
