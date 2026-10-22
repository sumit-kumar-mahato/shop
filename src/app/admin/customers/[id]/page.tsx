import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/session";
import { REVENUE_STATUSES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader, Panel, StatCard, Table, Td, Th } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import CustomerControls from "@/components/admin/CustomerControls";

export const metadata = { title: "Customer" };

export default async function AdminCustomerPage({ params }: { params: { id: string } }) {
  const me = await requireStaffPage();
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      addresses: { orderBy: { isDefault: "desc" } },
      orders: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { reviews: true, wishlist: true } },
    },
  });
  if (!user) notFound();
  const paid = user.orders.filter((o) => REVENUE_STATUSES.includes(o.status));
  const spent = paid.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <PageHeader title={user.name} description={`Customer since ${formatDate(user.createdAt)}`} back={{ href: "/admin/customers", label: "Customers" }} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total spent" value={formatINR(spent)} />
        <StatCard label="Orders" value={String(paid.length)} hint={user.orders.length !== paid.length ? `${user.orders.length - paid.length} cancelled/unpaid` : undefined} />
        <StatCard label="Average order" value={formatINR(paid.length ? Math.round(spent / paid.length) : 0)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Panel title="Orders" padded={false}>
          {user.orders.length === 0 ? (
            <p className="p-5 text-sm text-zinc-500">No orders yet.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Total</Th>
                </tr>
              </thead>
              <tbody>
                {user.orders.map((o) => (
                  <tr key={o.id}>
                    <Td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link></Td>
                    <Td className="text-zinc-500">{formatDate(o.createdAt)}</Td>
                    <Td><OrderStatusBadge status={o.status} /></Td>
                    <Td className="text-right tabular-nums">{formatINR(o.total)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>
        <div className="space-y-6">
          <Panel title="Contact">
            <div className="space-y-1 text-sm">
              <p><a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a> {user.emailVerifiedAt ? <span className="text-green-600">✓ verified</span> : <span className="text-amber-600">unverified</span>}</p>
              {user.phone && <p><a href={`tel:${user.phone}`} className="hover:underline">{user.phone}</a></p>}
              <p className="text-zinc-500">Last sign-in: {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "never"}</p>
              <p className="text-zinc-500">{user._count.reviews} reviews · {user._count.wishlist} wishlist items</p>
            </div>
          </Panel>
          {user.addresses.length > 0 && (
            <Panel title="Addresses">
              <ul className="space-y-3 text-sm">
                {user.addresses.map((a) => (
                  <li key={a.id}>
                    {a.fullName}{a.isDefault && <span className="text-zinc-500"> (default)</span>}
                    <br />
                    <span className="text-zinc-500">{a.line1}, {a.city}, {a.state} – {a.postalCode}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          <CustomerControls id={user.id} role={user.role} isActive={user.isActive} canManage={me.role === "ADMIN" && me.id !== user.id} />
        </div>
      </div>
    </div>
  );
}
