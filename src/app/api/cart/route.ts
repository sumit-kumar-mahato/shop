import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { getUserCartLines, quoteCart } from "@/lib/cart";
import { MAX_QTY_PER_LINE } from "@/lib/constants";

// Signed-in cart, stored in the database so it follows the customer across devices.

function couponFrom(req: Request) {
  return new URL(req.url).searchParams.get("coupon")?.slice(0, 30) || null;
}

async function respond(userId: string, coupon: string | null) {
  return ok(await quoteCart(await getUserCartLines(userId), coupon, userId));
}

export const GET = route(async (req) => {
  const user = await requireUser();
  return respond(user.id, couponFrom(req));
});

const addSchema = z.object({ variantId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE) });

/** Add to cart (increments quantity). */
export const POST = route(async (req) => {
  const user = await requireUser();
  const { variantId, quantity } = await parseJson(req, addSchema);
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { product: { select: { status: true } } } });
  if (!variant || !variant.isActive || variant.product.status !== "ACTIVE") throw new ApiError(404, "This item is no longer available.");
  if (variant.stock <= 0) throw new ApiError(409, "This size is out of stock.");

  const existing = await prisma.cartItem.findUnique({ where: { userId_variantId: { userId: user.id, variantId } } });
  const next = Math.min((existing?.quantity ?? 0) + quantity, variant.stock, MAX_QTY_PER_LINE);
  await prisma.cartItem.upsert({
    where: { userId_variantId: { userId: user.id, variantId } },
    create: { userId: user.id, variantId, quantity: next },
    update: { quantity: next },
  });
  return respond(user.id, couponFrom(req));
});

const setSchema = z.object({ variantId: z.string().min(1).max(40), quantity: z.number().int().min(0).max(MAX_QTY_PER_LINE) });

/** Set the quantity of a line (0 removes it). */
export const PUT = route(async (req) => {
  const user = await requireUser();
  const { variantId, quantity } = await parseJson(req, setSchema);
  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { userId: user.id, variantId } });
  } else {
    await prisma.cartItem.updateMany({ where: { userId: user.id, variantId }, data: { quantity } });
  }
  return respond(user.id, couponFrom(req));
});

export const DELETE = route(async (req) => {
  const user = await requireUser();
  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  return respond(user.id, couponFrom(req));
});
