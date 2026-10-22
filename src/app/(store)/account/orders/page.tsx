import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { formatINR } from "@/lib/money";
import { formatDate, pluralize } from "@/lib/utils";
import { Card, EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUserPage("/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { select: { image: true, title: true, quantity: true } } },
  });

  if (orders.length === 0) {
    return <EmptyState icon={<Package size={40} />} title="No orders yet" description="When you place an order, you can track it here." action={<LinkButton href="/shop">Start shopping</LinkButton>} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Orders</h2>
      {orders.map((o) => {
        const qty = o.items.reduce((n, i) => n + i.quantity, 0);
        return (
          <Link key={o.id} href={`/account/orders/${o.orderNumber}`} className="block">
            <Card className="p-5 transition-colors hover:border-luxury-400">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.orderNumber}</p>
                  <p className="text-sm text-luxury-500">
                    {formatDate(o.createdAt)} · {pluralize(qty, "item")} · {formatINR(o.total)}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
              <div className="mt-4 flex gap-2">
                {o.items.slice(0, 5).map((i, idx) => (
                  <div key={idx} className="h-16 w-12 overflow-hidden bg-luxury-100 dark:bg-zinc-800" title={i.title}>
                    {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                ))}
                {o.items.length > 5 && <span className="self-center text-sm text-luxury-500">+{o.items.length - 5}</span>}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
