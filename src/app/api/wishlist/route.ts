import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";

export const GET = route(async () => {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({ where: { userId: user.id }, select: { productId: true } });
  return ok({ productIds: items.map((i) => i.productId) });
});

const schema = z.object({ productId: z.string().min(1).max(40) });

export const POST = route(async (req) => {
  const user = await requireUser();
  const { productId } = await parseJson(req, schema);
  const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE" }, select: { id: true } });
  if (!product) throw new ApiError(404, "Product not found.");
  const count = await prisma.wishlistItem.count({ where: { userId: user.id } });
  if (count >= 200) throw new ApiError(400, "Your wishlist is full.");
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    create: { userId: user.id, productId },
    update: {},
  });
  return ok({ success: true });
});

export const DELETE = route(async (req) => {
  const user = await requireUser();
  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) throw new ApiError(400, "Missing productId.");
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id, productId } });
  return ok({ success: true });
});
