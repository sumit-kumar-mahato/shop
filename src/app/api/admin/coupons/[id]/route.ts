import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { couponData, couponInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const input = await parseJson(req, couponInputSchema);
  const coupon = await prisma.coupon.update({ where: { id: params.id }, data: couponData(input) });
  await audit(staff.id, "coupon.update", "Coupon", coupon.id, { code: coupon.code });
  return ok({ coupon });
});

export const DELETE = route(async (_req, { params }) => {
  const staff = await requireStaff();
  const coupon = await prisma.coupon.findUniqueOrThrow({ where: { id: params.id }, include: { _count: { select: { orders: true } } } });
  // Coupons used in orders are deactivated rather than deleted so order history keeps its reference.
  if (coupon._count.orders > 0) {
    await prisma.coupon.update({ where: { id: coupon.id }, data: { isActive: false } });
  } else {
    await prisma.coupon.delete({ where: { id: coupon.id } });
  }
  await audit(staff.id, "coupon.delete", "Coupon", coupon.id, { code: coupon.code });
  return ok({ deactivated: coupon._count.orders > 0 });
});
