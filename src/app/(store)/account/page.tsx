import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { REVENUE_STATUSES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Misc";
import ProfileForm from "./ProfileForm";
import VerifyBanner from "./VerifyBanner";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage({ searchParams }: { searchParams: { welcome?: string } }) {
  const user = await requireUserPage("/account");
  const [record, orderStats, wishlistCount, lastOrder] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { createdAt: true, phone: true } }),
    prisma.order.aggregate({ where: { userId: user.id, status: { in: REVENUE_STATUSES } }, _count: { _all: true }, _sum: { total: true } }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.order.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { orderNumber: true, status: true, createdAt: true } }),
  ]);

  return (
    <div className="space-y-6">
      {searchParams.welcome && (
        <div className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          Welcome! Your account is ready. We&apos;ve sent you an email to confirm your address.
        </div>
      )}
      {!user.emailVerified && <VerifyBanner email={user.email} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Orders placed" value={String(orderStats._count._all)} href="/account/orders" />
        <Stat label="Total spent" value={formatINR(orderStats._sum.total ?? 0)} />
        <Stat label="Wishlist" value={String(wishlistCount)} href="/account/wishlist" />
      </div>

      {lastOrder && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="text-sm">
            <p className="text-luxury-500">Latest order</p>
            <p className="font-semibold">
              {lastOrder.orderNumber} · placed {formatDate(lastOrder.createdAt)}
            </p>
          </div>
          <Link href={`/account/orders/${lastOrder.orderNumber}`} className="text-sm font-semibold underline">
            Track order
          </Link>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-1 font-serif text-xl">Personal details</h2>
        <p className="mb-5 text-sm text-luxury-500">Member since {formatDate(record.createdAt, { month: "long", year: "numeric" })}</p>
        <ProfileForm initial={{ name: user.name, phone: record.phone ?? "", email: user.email }} />
      </Card>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <Card className="p-5 transition-colors hover:border-luxury-400">
      <p className="text-xs uppercase tracking-wider text-luxury-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
