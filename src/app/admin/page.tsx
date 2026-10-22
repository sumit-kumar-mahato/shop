import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Circle, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { getLaunchChecklist } from "@/lib/launch-checklist";
import { prisma, table } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { expireStalePendingOrders } from "@/lib/orders";
import { ORDER_STATUS_LABELS, REVENUE_STATUSES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { PageHeader, Panel, StatCard, Table, Td, Th } from "@/components/admin/ui";
import RevenueChart from "@/components/admin/RevenueChart";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";

export const metadata = { title: "Dashboard" };

const DAY = 86_400_000;

function pctChange(now: number, before: number) {
  if (before === 0) return now > 0 ? 100 : null;
  return ((now - before) / before) * 100;
}

export default async function AdminDashboard() {
  await expireStalePendingOrders();
  const [store, checklist] = await Promise.all([getSettings("store"), getLaunchChecklist()]);
  const todo = checklist.filter((c) => !c.done);
  const now = Date.now();
  const since30 = new Date(now - 30 * DAY);
  const since60 = new Date(now - 60 * DAY);
  const revenueWhere = { status: { in: REVENUE_STATUSES } };

  const [cur, prev, newCustomers, prevCustomers, toFulfil, lowStock, daily, topProducts, byStatus, recent] = await Promise.all([
    prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: since30 } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: since60, lt: since30 } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since60, lt: since30 } } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING"] } } }),
    prisma.productVariant.findMany({
      where: { isActive: true, stock: { lte: store.orders.lowStockThreshold }, product: { status: "ACTIVE" } },
      orderBy: { stock: "asc" },
      take: 8,
      include: { product: { select: { id: true, title: true } } },
    }),
    prisma.$queryRaw<Array<{ day: Date; revenue: bigint; orders: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM("total"), 0) AS revenue, COUNT(*) AS orders
      FROM ${table("Order")}
      WHERE "createdAt" >= ${since30}
        AND "status"::text IN ('CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','RETURN_REQUESTED')
      GROUP BY 1 ORDER BY 1`,
    prisma.orderItem.groupBy({
      by: ["productId", "title"],
      where: { order: { ...revenueWhere, createdAt: { gte: since30 } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  // Fill in days with no orders so the chart has a continuous x-axis.
  const byDay = new Map(daily.map((d) => [new Date(d.day).toISOString().slice(0, 10), d]));
  const series = Array.from({ length: 30 }, (_, i) => {
    const key = new Date(now - (29 - i) * DAY).toISOString().slice(0, 10);
    const d = byDay.get(key);
    return { date: key, revenue: Number(d?.revenue ?? 0), orders: Number(d?.orders ?? 0) };
  });

  const revenue = cur._sum.total ?? 0;
  const orders = cur._count._all;
  const aov = orders ? Math.round(revenue / orders) : 0;
  const prevAov = prev._count._all ? Math.round((prev._sum.total ?? 0) / prev._count._all) : 0;
  const topMax = Math.max(1, ...topProducts.map((t) => t._sum.quantity ?? 0));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your store's performance over the last 30 days." />

      {todo.length > 0 && (
        <Panel title="Launch checklist" description={`${checklist.length - todo.length} of ${checklist.length} done — finish these before taking real orders.`}>
          <ul className="space-y-3">
            {checklist.map((c) => (
              <li key={c.title} className="flex gap-3 text-sm">
                {c.done ? <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-green-600" /> : <Circle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />}
                <div className="flex-1">
                  <p className={c.done ? "text-zinc-500 line-through" : "font-medium"}>{c.title}</p>
                  {!c.done && <p className="text-zinc-500 dark:text-zinc-400">{c.detail}</p>}
                </div>
                {!c.done && c.href && (
                  <Link href={c.href} className="flex flex-shrink-0 items-center gap-1 self-start font-medium hover:underline">
                    Fix <ArrowRight size={14} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatINR(revenue)} trend={pctChange(revenue, prev._sum.total ?? 0)} hint="vs previous 30 days" icon={<IndianRupee size={16} />} />
        <StatCard label="Orders" value={String(orders)} trend={pctChange(orders, prev._count._all)} hint="vs previous 30 days" icon={<ShoppingCart size={16} />} />
        <StatCard label="Average order value" value={formatINR(aov)} trend={pctChange(aov, prevAov)} hint="vs previous 30 days" icon={<Package size={16} />} />
        <StatCard label="New customers" value={String(newCustomers)} trend={pctChange(newCustomers, prevCustomers)} hint="vs previous 30 days" icon={<Users size={16} />} />
      </div>

      {toFulfil > 0 && (
        <Link href="/admin/orders?status=CONFIRMED" className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-900 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <span>
            <strong>{toFulfil}</strong> {toFulfil === 1 ? "order is" : "orders are"} waiting to be packed and shipped.
          </span>
          <span className="font-semibold">Review orders →</span>
        </Link>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Revenue" description="Daily revenue from confirmed orders" className="xl:col-span-2">
          <RevenueChart data={series} />
        </Panel>
        <Panel title="Orders by status">
          <ul className="space-y-2.5 text-sm">
            {byStatus
              .sort((a, b) => b._count._all - a._count._all)
              .map((s) => (
                <li key={s.status}>
                  <Link href={`/admin/orders?status=${s.status}`} className="flex items-center justify-between hover:underline">
                    <span>{ORDER_STATUS_LABELS[s.status]}</span>
                    <span className="font-semibold tabular-nums">{s._count._all}</span>
                  </Link>
                </li>
              ))}
            {byStatus.length === 0 && <li className="text-zinc-500">No orders yet.</li>}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top products" description="By units sold, last 30 days">
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales in this period yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((t) => (
                <li key={`${t.productId}-${t.title}`} className="text-sm">
                  <div className="flex justify-between gap-3">
                    {t.productId ? (
                      <Link href={`/admin/products/${t.productId}`} className="truncate hover:underline">{t.title}</Link>
                    ) : (
                      <span className="truncate">{t.title}</span>
                    )}
                    <span className="whitespace-nowrap tabular-nums text-zinc-500">
                      {t._sum.quantity} sold · {formatINR(t._sum.lineTotal ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-zinc-700 dark:bg-zinc-300" style={{ width: `${((t._sum.quantity ?? 0) / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Low stock" description={`Variants with ${store.orders.lowStockThreshold} or fewer in stock`} actions={<AlertTriangle size={16} className="text-amber-500" />}>
          {lowStock.length === 0 ? (
            <p className="text-sm text-zinc-500">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
              {lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/admin/products/${v.product.id}`} className="min-w-0 hover:underline">
                    <span className="block truncate">{v.product.title}</span>
                    <span className="text-xs text-zinc-500">{v.size} / {v.color} · {v.sku}</span>
                  </Link>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${v.stock === 0 ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"}`}>
                    {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-medium hover:underline">View all</Link>} padded={false}>
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">No orders yet. Share your store link to get your first sale!</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></Td>
                  <Td>{o.shippingName}</Td>
                  <Td className="text-zinc-500">{formatDate(o.createdAt)}</Td>
                  <Td><OrderStatusBadge status={o.status} /></Td>
                  <Td className="text-right font-medium tabular-nums">{formatINR(o.total)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
