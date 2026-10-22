import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import CouponManager from "@/components/admin/CouponManager";

export const metadata = { title: "Coupons" };

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <PageHeader title="Coupons" description="Discount codes customers can apply in their bag or at checkout." />
      <CouponManager
        initial={coupons.map((c) => ({
          ...c,
          startsAt: c.startsAt?.toISOString() ?? null,
          expiresAt: c.expiresAt?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
