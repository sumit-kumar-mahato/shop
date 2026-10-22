import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { refreshProductRating } from "@/lib/catalog";
import { audit } from "@/lib/audit";

const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) });

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const { status } = await parseJson(req, schema);
  const review = await prisma.review.update({ where: { id: params.id }, data: { status } });
  await refreshProductRating(review.productId);
  await audit(staff.id, "review.moderate", "Review", review.id, { status });
  return ok({ review });
});

export const DELETE = route(async (_req, { params }) => {
  const staff = await requireStaff();
  const review = await prisma.review.delete({ where: { id: params.id } });
  await refreshProductRating(review.productId);
  await audit(staff.id, "review.delete", "Review", review.id);
  return ok({ success: true });
});
