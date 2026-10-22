import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { CUSTOMER_CANCELLABLE, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/utils";
import { razorpayEnabled } from "@/lib/payments/razorpay";
import { Card } from "@/components/ui/Misc";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/store/OrderStatusBadge";
import OrderTracker from "@/components/store/OrderTracker";
import OrderActions from "./OrderActions";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({ params, searchParams }: { params: { orderNumber: string }; searchParams: { placed?: string; payment?: string } }) {
  const user = await requireUserPage(`/account/orders/${params.orderNumber}`);
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!order || order.userId !== user.id) notFound();

  const [store, theme] = await Promise.all([getSettings("store"), getSettings("theme")]);
  const deliveredAt = order.deliveredAt ?? order.updatedAt;
  const returnDeadline = new Date(deliveredAt.getTime() + store.orders.returnWindowDays * 86_400_000);
  const canReturn = order.status === "DELIVERED" && store.orders.returnWindowDays > 0 && Date.now() < returnDeadline.getTime();
  const canCancel = CUSTOMER_CANCELLABLE.includes(order.status);
  const canPay = order.status === "PENDING_PAYMENT" && order.paymentStatus !== "PAID" && razorpayEnabled();

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-luxury-600 hover:underline dark:text-zinc-400">
        <ArrowLeft size={14} /> All orders
      </Link>

      {searchParams.placed && order.status !== "PENDING_PAYMENT" && (
        <div className="flex items-start gap-3 rounded-sm border border-green-200 bg-green-50 p-5 text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          <CheckCircle2 className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Thank you! Your order has been placed.</p>
            <p className="text-sm">A confirmation has been sent to {order.email}. We&apos;ll email you again when it ships.</p>
          </div>
        </div>
      )}
      {order.status === "PENDING_PAYMENT" && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">{searchParams.payment === "failed" ? "Your payment didn't go through." : "We're waiting for your payment."}</p>
          <p>Complete the payment within 30 minutes of placing the order to confirm it — otherwise it will be cancelled automatically and the items released.</p>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-luxury-500">Order</p>
            <h2 className="font-serif text-2xl">{order.orderNumber}</h2>
            <p className="text-sm text-luxury-500">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        {order.status !== "CANCELLED" && order.status !== "PENDING_PAYMENT" && (
          <div className="mt-8">
            <OrderTracker status={order.status} />
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-6 rounded-sm bg-luxury-100 p-4 text-sm dark:bg-zinc-800">
            <p>
              <strong>Courier:</strong> {order.courierName ?? "—"} · <strong>Tracking no.:</strong> {order.trackingNumber}
            </p>
            {order.trackingUrl && (
              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-semibold underline">
                Track shipment →
              </a>
            )}
          </div>
        )}

        <OrderActions
          orderNumber={order.orderNumber}
          canCancel={canCancel}
          canReturn={canReturn}
          returnDeadline={canReturn ? formatDate(returnDeadline) : null}
          canPay={canPay}
          storeName={store.storeName}
          brandColor={theme.primaryColor}
        />
      </Card>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Items</h3>
          <ul className="divide-y divide-luxury-100 dark:divide-zinc-800">
            {order.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-3">
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-luxury-100 dark:bg-zinc-800">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-luxury-500">
                    {i.size} · {i.color} · Qty {i.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">{formatINR(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-luxury-200 pt-4 text-sm dark:border-zinc-800">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`−${formatINR(order.discount)}`} />}
            <Row label="Shipping" value={order.shippingFee ? formatINR(order.shippingFee) : "Free"} />
            {!order.taxIncluded && <Row label="GST" value={formatINR(order.tax)} />}
            <div className="flex justify-between border-t border-luxury-200 pt-2 text-base font-semibold dark:border-zinc-800">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
            {order.taxIncluded && order.tax > 0 && <p className="text-right text-xs text-luxury-500">Includes {formatINR(order.tax)} GST</p>}
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 text-sm">
            <h3 className="mb-2 font-semibold">Delivery address</h3>
            <p>{order.shippingName}</p>
            <p className="text-luxury-600 dark:text-zinc-400">
              {[order.shippingLine1, order.shippingLine2, order.shippingLandmark].filter(Boolean).join(", ")}
              <br />
              {order.shippingCity}, {order.shippingState} – {order.shippingPostal}
              <br />
              {order.phone}
            </p>
          </Card>
          <Card className="p-5 text-sm">
            <h3 className="mb-2 font-semibold">Payment</h3>
            <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            {order.paidAt && <p className="text-luxury-500">Paid on {formatDate(order.paidAt)}</p>}
          </Card>
          {order.status !== "PENDING_PAYMENT" && (
            <Link href={`/invoice/${order.orderNumber}`} target="_blank" className="flex items-center gap-2 text-sm font-semibold underline">
              <FileText size={16} /> Download invoice
            </Link>
          )}
        </div>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 font-semibold">Order history</h3>
        <ol className="space-y-4 border-l border-luxury-200 pl-5 dark:border-zinc-700">
          {order.events.map((e) => (
            <li key={e.id} className="relative text-sm">
              <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-brand" />
              <p className="font-medium">{ORDER_STATUS_LABELS[e.status]}</p>
              {e.note && <p className="text-luxury-600 dark:text-zinc-400">{e.note}</p>}
              <p className="text-xs text-luxury-500">{formatDateTime(e.createdAt)}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-luxury-600 dark:text-zinc-400">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
