import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { couponData, couponInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const POST = route(async (req) => {
  const staff = await requireStaff();
  const input = await parseJson(req, couponInputSchema);
  const coupon = await prisma.coupon.create({ data: couponData(input) });
  await audit(staff.id, "coupon.create", "Coupon", coupon.id, { code: coupon.code });
  return ok({ coupon }, { status: 201 });
});
