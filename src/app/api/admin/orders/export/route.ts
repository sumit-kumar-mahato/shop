import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff, route } from "@/lib/api";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { buildOrderWhere } from "@/lib/admin-queries";

// Neutralise spreadsheet formula injection (cells starting with = + - @).
function cell(value: string | number | null | undefined) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export const GET = route(async (req) => {
  await requireStaff();
  const sp = new URL(req.url).searchParams;
  const where = buildOrderWhere({ q: sp.get("q") ?? undefined, status: (sp.get("status") as OrderStatus) ?? undefined, payment: sp.get("payment") ?? undefined });
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { items: true }, take: 10_000 });

  const header = ["Order", "Date", "Customer", "Email", "Phone", "City", "State", "PIN", "Items", "Subtotal", "Discount", "Shipping", "Tax", "Total", "Payment method", "Payment status", "Status", "Coupon", "Courier", "Tracking"];
  const rows = orders.map((o) =>
    [
      o.orderNumber,
      o.createdAt.toISOString(),
      o.shippingName,
      o.email,
      o.phone,
      o.shippingCity,
      o.shippingState,
      o.shippingPostal,
      o.items.map((i) => `${i.title} (${i.size}/${i.color}) x${i.quantity}`).join("; "),
      (o.subtotal / 100).toFixed(2),
      (o.discount / 100).toFixed(2),
      (o.shippingFee / 100).toFixed(2),
      (o.tax / 100).toFixed(2),
      (o.total / 100).toFixed(2),
      PAYMENT_METHOD_LABELS[o.paymentMethod],
      PAYMENT_STATUS_LABELS[o.paymentStatus],
      ORDER_STATUS_LABELS[o.status],
      o.couponCode,
      o.courierName,
      o.trackingNumber,
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.map(cell).join(","), ...rows].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
