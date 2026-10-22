import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import PrintButton from "./PrintButton";

export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

export default async function InvoicePage({ params }: { params: { orderNumber: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/invoice/${encodeURIComponent(params.orderNumber)}`);
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber }, include: { items: true } });
  if (!order || (order.userId !== user.id && !isStaff(user))) notFound();
  const store = await getSettings("store");

  return (
    <div className="min-h-screen bg-white py-10 text-zinc-900">
      <div className="mx-auto max-w-3xl px-6">
        <div className="no-print mb-6 flex justify-end">
          <PrintButton />
        </div>
        <header className="flex flex-wrap justify-between gap-6 border-b-2 pb-6" style={{ borderColor: store.primaryColor }}>
          <div>
            <p className="font-display text-xl font-bold tracking-[0.15em]">{store.logoText}</p>
            <p className="mt-2 max-w-xs whitespace-pre-line text-sm text-zinc-600">{store.address}</p>
            <p className="text-sm text-zinc-600">{store.contactEmail} · {store.contactPhone}</p>
            {store.gstin && <p className="text-sm text-zinc-600">GSTIN: {store.gstin}</p>}
          </div>
          <div className="text-right text-sm">
            <p className="text-2xl font-semibold uppercase tracking-wider">Tax invoice</p>
            <p className="mt-2">Invoice no: <strong>{order.orderNumber}</strong></p>
            <p>Date: {formatDate(order.createdAt)}</p>
            <p>Payment: {PAYMENT_METHOD_LABELS[order.paymentMethod]} ({PAYMENT_STATUS_LABELS[order.paymentStatus]})</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Billed & shipped to</p>
            <p className="font-semibold">{order.shippingName}</p>
            <p>{[order.shippingLine1, order.shippingLine2, order.shippingLandmark].filter(Boolean).join(", ")}</p>
            <p>{order.shippingCity}, {order.shippingState} – {order.shippingPostal}</p>
            <p>{order.phone} · {order.email}</p>
          </div>
        </section>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-zinc-300 bg-zinc-50">
              <th className="px-2 py-2">Item</th>
              <th className="px-2 py-2">SKU</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-2 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-zinc-200">
                <td className="px-2 py-2">
                  {i.title}
                  <span className="block text-xs text-zinc-500">{i.size} / {i.color}</span>
                </td>
                <td className="px-2 py-2 font-mono text-xs">{i.sku}</td>
                <td className="px-2 py-2 text-right">{i.quantity}</td>
                <td className="px-2 py-2 text-right">{formatINR(i.unitPrice)}</td>
                <td className="px-2 py-2 text-right">{formatINR(i.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatINR(order.subtotal)} />
          {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatINR(order.discount)}`} />}
          <Row label="Shipping" value={order.shippingFee ? formatINR(order.shippingFee) : "Free"} />
          <Row label={order.taxIncluded ? "GST (included)" : "GST"} value={formatINR(order.tax)} />
          <div className="flex justify-between border-t-2 border-zinc-900 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>

        <footer className="mt-16 border-t pt-4 text-center text-xs text-zinc-500">
          Thank you for shopping with {store.storeName}. This is a computer-generated invoice.
        </footer>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-600">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
