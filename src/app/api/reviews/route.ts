import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().min(1).max(40),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

// Reviews are held for moderation in the admin panel before they appear on the site.
export const POST = route(async (req) => {
  const user = await requireUser();
  const limit = await rateLimit(`review:user:${user.id}`, 10, 3600);
  if (!limit.ok) throw new ApiError(429, "You're posting reviews too quickly. Please try again later.");

  const input = await parseJson(req, schema);
  const product = await prisma.product.findFirst({ where: { id: input.productId, status: "ACTIVE" }, select: { id: true } });
  if (!product) throw new ApiError(404, "Product not found.");

  const existing = await prisma.review.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } } });
  if (existing) throw new ApiError(409, "You have already reviewed this product.");

  const purchased = await prisma.orderItem.count({
    where: { productId: product.id, order: { userId: user.id, status: { in: ["DELIVERED", "RETURN_REQUESTED", "RETURNED"] } } },
  });

  await prisma.review.create({
    data: {
      productId: product.id,
      userId: user.id,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment,
      isVerifiedPurchase: purchased > 0,
    },
  });
  return ok({ success: true }, { status: 201 });
});
