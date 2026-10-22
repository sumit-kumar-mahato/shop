import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { buildOrderWhere } from "@/lib/admin-queries";
import { expireStalePendingOrders } from "@/lib/orders";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDateTime, cn } from "@/lib/utils";
import { AdminPagination, PageHeader, Panel, withParams } from "@/components/admin/ui";
import OrderTable from "@/components/admin/OrderTable";

export const metadata = { title: "Orders" };
const PER_PAGE = 25;

type SP = { q?: string; status?: string; payment?: string; page?: string };

const TABS: Array<{ label: string; status?: string }> = [
  { label: "All" },
  { label: "To fulfil", status: "CONFIRMED" },
  { label: "Packing", status: "PROCESSING" },
  { label: "Shipped", status: "SHIPPED" },
  { label: "Delivered", status: "DELIVERED" },
  { label: "Returns", status: "RETURN_REQUESTED" },
  { label: "Awaiting payment", status: "PENDING_PAYMENT" },
  { label: "Cancelled", status: "CANCELLED" },
];

export default async function AdminOrders({ searchParams }: { searchParams: SP }) {
  await expireStalePendingOrders();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const where = buildOrderWhere(searchParams);
  const [total, orders, counts] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.groupBy({ by: ["status"], where: buildOrderWhere({ q: searchParams.q, payment: searchParams.payment }), _count: { _all: true } }),
  ]);
  const countOf = (status?: string) => (status ? counts.find((c) => c.status === status)?._count._all ?? 0 : counts.reduce((n, c) => n + c._count._all, 0));
  const exportHref = withParams("/api/admin/orders/export", searchParams, { page: undefined });

  return (
    <div>
      <PageHeader
        title="Orders"
        description={`${total} ${total === 1 ? "order" : "orders"}${searchParams.status ? ` · ${ORDER_STATUS_LABELS[searchParams.status as keyof typeof ORDER_STATUS_LABELS] ?? ""}` : ""}`}
        actions={
          <a href={exportHref} className="inline-flex h-9 items-center gap-2 rounded-sm border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            <Download size={16} /> Export CSV
          </a>
        }
      />
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => {
          const active = (searchParams.status ?? "") === (t.status ?? "");
          return (
            <Link
              key={t.label}
              href={withParams("/admin/orders", { q: searchParams.q }, { status: t.status })}
              className={cn("flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", active ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800")}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", active ? "bg-white/20 dark:bg-zinc-900/10" : "bg-zinc-200 dark:bg-zinc-800")}>{countOf(t.status)}</span>
            </Link>
          );
        })}
      </div>
      <Panel padded={false}>
        <form className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
          <input name="q" defaultValue={searchParams.q} placeholder="Search order no., name, email or phone…" className="h-10 min-w-[220px] flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          <select name="payment" defaultValue={searchParams.payment ?? ""} className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">Any payment</option>
            <option value="PENDING">Payment pending</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
          <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">Search</button>
        </form>
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No orders match.</p>
        ) : (
          <OrderTable
            rows={orders.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              date: formatDateTime(o.createdAt),
              name: o.shippingName,
              place: `${o.shippingCity}, ${o.shippingState}`,
              paymentStatus: o.paymentStatus,
              method: o.paymentMethod === "COD" ? "COD" : PAYMENT_METHOD_LABELS[o.paymentMethod].split(" ")[0],
              status: o.status,
              items: o._count.items,
              total: o.total,
            }))}
          />
        )}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => withParams("/admin/orders", searchParams, { page: p })} />
      </Panel>
    </div>
  );
}
