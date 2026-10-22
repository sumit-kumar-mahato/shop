import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { ORDER_STATUS_LABELS, ORDER_TRANSITIONS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/store/OrderStatusBadge";
import OrderManager from "@/components/admin/OrderManager";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, name: true, email: true, _count: { select: { orders: true } } } },
    },
  });
  if (!order) notFound();

  return (
    <div>
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        back={{ href: "/admin/orders", label: "Orders" }}
        actions={
          <Link href={`/invoice/${order.orderNumber}`} target="_blank" className="inline-flex h-9 items-center gap-2 rounded-sm border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <FileText size={16} /> Invoice
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>

      {order.adminNote?.includes("⚠") && (
        <div className="mb-6 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{order.adminNote}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Panel title={`Items (${order.items.reduce((n, i) => n + i.quantity, 0)})`} padded={false}>
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-4 px-5 py-3">
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">{i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="flex-1 text-sm">
                    {i.productId ? <Link href={`/admin/products/${i.productId}`} className="font-medium hover:underline">{i.title}</Link> : <p className="font-medium">{i.title}</p>}
                    <p className="text-zinc-500">{i.size} / {i.color} · <span className="font-mono text-xs">{i.sku}</span></p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatINR(i.unitPrice)} × {i.quantity}</p>
                    <p className="font-medium">{formatINR(i.lineTotal)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-zinc-200 px-5 py-4 text-sm dark:border-zinc-800">
              <Row label="Subtotal" value={formatINR(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount (${order.couponCode})`} value={`−${formatINR(order.discount)}`} />}
              <Row label="Shipping" value={order.shippingFee ? formatINR(order.shippingFee) : "Free"} />
              <Row label={order.taxIncluded ? "GST (included)" : "GST"} value={formatINR(order.tax)} />
              <div className="flex justify-between pt-1 text-base font-semibold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </Panel>

          <OrderManager
            order={{
              id: order.id,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              courierName: order.courierName ?? "",
              trackingNumber: order.trackingNumber ?? "",
              trackingUrl: order.trackingUrl ?? "",
              adminNote: order.adminNote ?? "",
            }}
            transitions={ORDER_TRANSITIONS[order.status]}
          />

          <Panel title="Timeline">
            <ol className="space-y-4 border-l border-zinc-200 pl-5 dark:border-zinc-700">
              {order.events.map((e) => (
                <li key={e.id} className="relative text-sm">
                  <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-400" />
                  <p className="font-medium">{ORDER_STATUS_LABELS[e.status]}</p>
                  {e.note && <p className="text-zinc-600 dark:text-zinc-400">{e.note}</p>}
                  <p className="text-xs text-zinc-500">{formatDateTime(e.createdAt)}{e.actor && ` · ${e.actor}`}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            <div className="space-y-1 text-sm">
              {order.user ? (
                <Link href={`/admin/customers/${order.user.id}`} className="font-medium hover:underline">{order.user.name}</Link>
              ) : (
                <p className="font-medium">{order.shippingName}</p>
              )}
              <p><a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a></p>
              <p><a href={`tel:${order.phone}`} className="hover:underline">{order.phone}</a></p>
              {order.user && <p className="text-zinc-500">{order.user._count.orders} orders in total</p>}
            </div>
          </Panel>
          <Panel title="Shipping address">
            <p className="text-sm leading-relaxed">
              {order.shippingName}<br />
              {order.shippingLine1}<br />
              {order.shippingLine2 && <>{order.shippingLine2}<br /></>}
              {order.shippingLandmark && <>Near {order.shippingLandmark}<br /></>}
              {order.shippingCity}, {order.shippingState} – {order.shippingPostal}<br />
              {order.shippingCountry}
            </p>
          </Panel>
          <Panel title="Payment">
            <div className="space-y-1 text-sm">
              <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
              {order.paidAt && <p className="text-zinc-500">Paid {formatDateTime(order.paidAt)}</p>}
              {order.razorpayPaymentId && <p className="font-mono text-xs text-zinc-500">Razorpay: {order.razorpayPaymentId}</p>}
            </div>
          </Panel>
          {(order.customerNote || order.returnReason) && (
            <Panel title="Customer notes">
              {order.customerNote && <p className="text-sm">{order.customerNote}</p>}
              {order.returnReason && <p className="mt-2 text-sm"><strong>Return reason:</strong> {order.returnReason}</p>}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
