import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Circle,
  IndianRupee,
  LayoutTemplate,
  MessageSquareText,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { getLaunchChecklist } from "@/lib/launch-checklist";
import { prisma, table } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { requireStaffPage } from "@/lib/auth/session";
import { expireStalePendingOrders } from "@/lib/orders";
import { ORDER_STATUS_LABELS, REVENUE_STATUSES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { cn, formatDate } from "@/lib/utils";
import { Panel, StatCard, Table, Td, Th } from "@/components/admin/ui";
import RevenueChart from "@/components/admin/RevenueChart";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";

export const metadata = { title: "Dashboard" };

const DAY = 86_400_000;
const RANGES = [7, 30, 90] as const;

function pctChange(now: number, before: number) {
  if (before === 0) return now > 0 ? 100 : null;
  return ((now - before) / before) * 100;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-zinc-400",
  CONFIRMED: "bg-blue-500",
  PROCESSING: "bg-indigo-500",
  SHIPPED: "bg-violet-500",
  OUT_FOR_DELIVERY: "bg-fuchsia-500",
  DELIVERED: "bg-green-500",
  RETURN_REQUESTED: "bg-amber-500",
  RETURNED: "bg-orange-500",
  CANCELLED: "bg-red-500",
};

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function AdminDashboard({ searchParams }: { searchParams: { range?: string } }) {
  await expireStalePendingOrders();
  const user = await requireStaffPage();
  const days = RANGES.find((r) => String(r) === searchParams.range) ?? 30;
  const [store, checklist] = await Promise.all([getSettings("store"), getLaunchChecklist()]);
  const todo = checklist.filter((c) => !c.done);
  const now = Date.now();
  const since = new Date(now - days * DAY);
  const before = new Date(now - 2 * days * DAY);
  // Midnight in India, whatever the server's time zone.
  const IST = 330 * 60_000;
  const today = new Date(Math.floor((now + IST) / DAY) * DAY - IST);
  const revenueWhere = { status: { in: REVENUE_STATUSES } };

  const [cur, prev, todayAgg, newCustomers, prevCustomers, toFulfil, lowStock, daily, topProducts, byStatus, recent, pendingReviews, carts] = await Promise.all([
    prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: since } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: before, lt: since } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.aggregate({ where: { ...revenueWhere, createdAt: { gte: today } }, _sum: { total: true }, _count: { _all: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since } } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: before, lt: since } } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING"] } } }),
    prisma.productVariant.findMany({
      where: { isActive: true, stock: { lte: store.orders.lowStockThreshold }, product: { status: "ACTIVE" } },
      orderBy: { stock: "asc" },
      take: 8,
      include: { product: { select: { id: true, title: true, images: true } } },
    }),
    prisma.$queryRaw<Array<{ day: Date; revenue: bigint; orders: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM("total"), 0) AS revenue, COUNT(*) AS orders
      FROM ${table("Order")}
      WHERE "createdAt" >= ${since}
        AND "status"::text IN ('CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED','RETURN_REQUESTED')
      GROUP BY 1 ORDER BY 1`,
    prisma.orderItem.groupBy({
      by: ["productId", "title"],
      where: { order: { ...revenueWhere, createdAt: { gte: since } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.review.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 4, include: { user: { select: { name: true } }, product: { select: { title: true } } } }),
    // Shopping bags with items that were touched in the last week (potential sales to follow up).
    prisma.cartItem.findMany({
      where: { updatedAt: { gte: new Date(now - 7 * DAY) } },
      select: { userId: true, quantity: true, variant: { select: { price: true, product: { select: { price: true } } } } },
    }),
  ]);

  // Fill in days with no orders so the chart has a continuous x-axis.
  const byDay = new Map(daily.map((d) => [new Date(d.day).toISOString().slice(0, 10), d]));
  const series = Array.from({ length: days }, (_, i) => {
    const key = new Date(now - (days - 1 - i) * DAY).toISOString().slice(0, 10);
    const d = byDay.get(key);
    return { date: key, revenue: Number(d?.revenue ?? 0), orders: Number(d?.orders ?? 0) };
  });

  const revenue = cur._sum.total ?? 0;
  const orders = cur._count._all;
  const aov = orders ? Math.round(revenue / orders) : 0;
  const prevAov = prev._count._all ? Math.round((prev._sum.total ?? 0) / prev._count._all) : 0;
  const topMax = Math.max(1, ...topProducts.map((t) => t._sum.quantity ?? 0));
  const statusTotal = byStatus.reduce((s, b) => s + b._count._all, 0);
  const cartUsers = new Set(carts.map((c) => c.userId)).size;
  const cartValue = carts.reduce((s, c) => s + c.quantity * (c.variant.price ?? c.variant.product.price), 0);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Today: <strong className="text-zinc-900 dark:text-white">{todayAgg._count._all}</strong> {todayAgg._count._all === 1 ? "order" : "orders"} ·{" "}
            <strong className="text-zinc-900 dark:text-white">{formatINR(todayAgg._sum.total ?? 0)}</strong>
          </p>
        </div>
        <div className="inline-flex rounded-lg bg-zinc-200/70 p-1 dark:bg-zinc-800" role="tablist" aria-label="Period">
          {RANGES.map((r) => (
            <Link key={r} href={r === 30 ? "/admin" : `/admin?range=${r}`} role="tab" aria-selected={r === days} className={cn("rounded-md px-3 py-1.5 text-sm font-medium", r === days ? "bg-white shadow-sm dark:bg-zinc-950" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white")}>
              {r} days
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickAction href="/admin/products/new" icon={<Plus size={18} />} label="Add product" />
        <QuickAction href="/admin/homepage" icon={<LayoutTemplate size={18} />} label="Edit homepage" />
        <QuickAction href="/admin/appearance" icon={<Palette size={18} />} label="Appearance" />
        <QuickAction href="/admin/coupons" icon={<Tag size={18} />} label="Create coupon" />
      </div>

      {todo.length > 0 && (
        <Panel
          title="Launch checklist"
          description={`${checklist.length - todo.length} of ${checklist.length} done — finish these before taking real orders.`}
          actions={
            <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${((checklist.length - todo.length) / checklist.length) * 100}%` }} />
            </div>
          }
        >
          <ul className="grid gap-3 md:grid-cols-2">
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
        <StatCard label="Revenue" value={formatINR(revenue)} trend={pctChange(revenue, prev._sum.total ?? 0)} hint={`vs previous ${days} days`} icon={<IndianRupee size={16} />} spark={series.map((s) => s.revenue)} />
        <StatCard label="Orders" value={String(orders)} trend={pctChange(orders, prev._count._all)} hint={`vs previous ${days} days`} icon={<ShoppingCart size={16} />} spark={series.map((s) => s.orders)} href="/admin/orders" />
        <StatCard label="Average order value" value={formatINR(aov)} trend={pctChange(aov, prevAov)} hint={`vs previous ${days} days`} icon={<Package size={16} />} />
        <StatCard label="New customers" value={String(newCustomers)} trend={pctChange(newCustomers, prevCustomers)} hint={`vs previous ${days} days`} icon={<Users size={16} />} href="/admin/customers" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {toFulfil > 0 ? (
          <Link href="/admin/orders?status=CONFIRMED" className="group flex items-center gap-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white px-5 py-4 text-sm text-blue-950 shadow-sm hover:shadow-md dark:border-blue-900 dark:from-blue-950/50 dark:to-zinc-900 dark:text-blue-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white"><ShoppingCart size={20} /></span>
            <span className="flex-1">
              <strong className="block text-base">{toFulfil} {toFulfil === 1 ? "order" : "orders"} to fulfil</strong>
              Pack and ship them to keep customers happy.
            </span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"><CheckCircle2 size={20} /></span>
            <span><strong className="block text-base">All orders are fulfilled</strong><span className="text-zinc-500">Nothing is waiting to be shipped.</span></span>
          </div>
        )}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"><ShoppingBag size={20} /></span>
          <span className="flex-1">
            <strong className="block text-base">{cartUsers} open shopping {cartUsers === 1 ? "bag" : "bags"}</strong>
            <span className="text-zinc-500">{formatINR(cartValue)} of products in signed-in customers’ bags this week.</span>
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Revenue" description={`Daily revenue from confirmed orders, last ${days} days`} className="xl:col-span-2">
          <RevenueChart data={series} />
        </Panel>
        <Panel title="Orders by status" description="All time">
          {byStatus.length === 0 ? (
            <p className="text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <>
              <div className="mb-5 flex h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                {byStatus.map((s) => (
                  <div key={s.status} className={STATUS_COLORS[s.status] ?? "bg-zinc-400"} style={{ width: `${(s._count._all / statusTotal) * 100}%` }} title={ORDER_STATUS_LABELS[s.status]} />
                ))}
              </div>
              <ul className="space-y-2 text-sm">
                {[...byStatus]
                  .sort((a, b) => b._count._all - a._count._all)
                  .map((s) => (
                    <li key={s.status}>
                      <Link href={`/admin/orders?status=${s.status}`} className="flex items-center gap-2.5 rounded-md px-1 py-0.5 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_COLORS[s.status] ?? "bg-zinc-400")} />
                        <span className="flex-1">{ORDER_STATUS_LABELS[s.status]}</span>
                        <span className="font-semibold tabular-nums">{s._count._all}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Top products" description={`By units sold, last ${days} days`}>
          {topProducts.length === 0 ? (
            <p className="text-sm text-zinc-500">No sales in this period yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((t, i) => (
                <li key={`${t.productId}-${t.title}`} className="text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold dark:bg-zinc-800">{i + 1}</span>
                      {t.productId ? <Link href={`/admin/products/${t.productId}`} className="truncate hover:underline">{t.title}</Link> : <span className="truncate">{t.title}</span>}
                    </span>
                    <span className="whitespace-nowrap tabular-nums text-zinc-500">
                      {t._sum.quantity} sold · {formatINR(t._sum.lineTotal ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${((t._sum.quantity ?? 0) / topMax) * 100}%` }} />
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
                  <Link href={`/admin/products/${v.product.id}`} className="flex min-w-0 items-center gap-3 hover:underline">
                    <span className="h-10 w-8 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">{v.product.images[0] && <img src={v.product.images[0]} alt="" className="h-full w-full object-cover" />}</span>
                    <span className="min-w-0">
                      <span className="block truncate">{v.product.title}</span>
                      <span className="text-xs text-zinc-500">{v.size} / {v.color} · {v.sku}</span>
                    </span>
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.stock === 0 ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"}`}>
                    {v.stock === 0 ? "Out of stock" : `${v.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recent orders" actions={<Link href="/admin/orders" className="text-sm font-medium hover:underline">View all</Link>} padded={false} className="xl:col-span-2">
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
        <Panel title="Reviews to approve" actions={<Link href="/admin/reviews" className="text-sm font-medium hover:underline">Moderate</Link>}>
          {pendingReviews.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-zinc-500"><MessageSquareText size={16} /> No reviews are waiting.</p>
          ) : (
            <ul className="space-y-4">
              {pendingReviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />)}
                    <span className="ml-1 truncate text-xs text-zinc-500">{r.product.title}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-zinc-700 dark:text-zinc-300">“{r.comment}”</p>
                  <p className="mt-0.5 text-xs text-zinc-500">— {r.user.name}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white transition-colors group-hover:bg-brand group-hover:text-brand-fg dark:bg-white dark:text-zinc-900">{icon}</span>
      {label}
    </Link>
  );
}
