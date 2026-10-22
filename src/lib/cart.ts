import "server-only";
import { prisma } from "@/lib/db";
import { MAX_QTY_PER_LINE } from "@/lib/constants";
import { amountToFreeShipping, computeTotals, type PricingConfig } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";
import { checkCoupon } from "@/lib/coupons";
import type { CartQuote, QuoteLine } from "@/lib/types";
import type { StoreSettings } from "@/lib/settings-schema";

export function pricingConfig(store: StoreSettings): PricingConfig {
  return {
    flatShippingFee: store.shipping.flatFee,
    freeShippingThreshold: store.shipping.freeShippingThreshold,
    taxRatePercent: store.tax.ratePercent,
    pricesIncludeTax: store.tax.pricesIncludeTax,
  };
}

/**
 * Build an authoritative cart quote from variant ids + quantities.
 * Prices and stock always come from the database, never from the browser.
 */
export async function quoteCart(
  input: Array<{ variantId: string; quantity: number }>,
  couponCode: string | null | undefined,
  userId?: string | null,
): Promise<CartQuote> {
  // Merge duplicate lines.
  const wanted = new Map<string, number>();
  for (const l of input) {
    if (l.quantity > 0) wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + l.quantity);
  }

  const variants = wanted.size
    ? await prisma.productVariant.findMany({
        where: { id: { in: [...wanted.keys()] } },
        include: { product: { select: { id: true, slug: true, title: true, images: true, price: true, compareAtPrice: true, status: true } } },
      })
    : [];
  const byId = new Map(variants.map((v) => [v.id, v]));

  const lines: QuoteLine[] = [];
  for (const [variantId, requested] of wanted) {
    const v = byId.get(variantId);
    if (!v) continue; // variant deleted — silently drop
    const purchasable = v.isActive && v.product.status === "ACTIVE";
    const maxQuantity = purchasable ? Math.min(v.stock, MAX_QTY_PER_LINE) : 0;
    const quantity = Math.min(requested, Math.max(maxQuantity, 0));
    const unitPrice = v.price ?? v.product.price;
    lines.push({
      variantId,
      productId: v.product.id,
      slug: v.product.slug,
      title: v.product.title,
      image: v.product.images[0] ?? null,
      size: v.size,
      color: v.color,
      sku: v.sku,
      unitPrice,
      compareAtPrice: v.product.compareAtPrice,
      quantity: maxQuantity === 0 ? requested : quantity,
      maxQuantity,
      lineTotal: unitPrice * quantity,
      issue: !purchasable ? "UNAVAILABLE" : maxQuantity === 0 ? "OUT_OF_STOCK" : quantity < requested ? "QUANTITY_REDUCED" : null,
    });
  }

  const store = await getSettings("store");
  const config = pricingConfig(store);
  const billable = lines.filter((l) => l.issue !== "OUT_OF_STOCK" && l.issue !== "UNAVAILABLE");
  const pricingLines = billable.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity }));
  const subtotal = pricingLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  let couponResult: CartQuote["coupon"] = null;
  let rule = null;
  if (couponCode) {
    const check = await checkCoupon(couponCode, subtotal, userId);
    if (check.ok) {
      rule = check.rule;
      couponResult = { code: check.coupon.code, applied: true, message: null, discount: 0 };
    } else {
      couponResult = { code: couponCode.trim().toUpperCase(), applied: false, message: check.message, discount: 0 };
    }
  }

  const totals = computeTotals(pricingLines, rule, config);
  if (couponResult) couponResult.discount = totals.discount;

  return {
    lines,
    totals,
    coupon: couponResult,
    freeShippingThreshold: config.freeShippingThreshold,
    amountToFreeShipping: amountToFreeShipping(totals.subtotal - totals.discount, config),
    hasIssues: lines.some((l) => l.issue !== null),
  };
}

export async function getUserCartLines(userId: string) {
  const items = await prisma.cartItem.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
}

/** Merge a guest (browser) cart into the user's saved cart after sign-in. */
export async function mergeGuestCart(userId: string, lines: Array<{ variantId: string; quantity: number }>) {
  for (const line of lines.slice(0, 50)) {
    if (line.quantity <= 0) continue;
    const variant = await prisma.productVariant.findUnique({ where: { id: line.variantId }, select: { id: true } });
    if (!variant) continue;
    const existing = await prisma.cartItem.findUnique({ where: { userId_variantId: { userId, variantId: line.variantId } } });
    const quantity = Math.min((existing?.quantity ?? 0) + line.quantity, MAX_QTY_PER_LINE);
    await prisma.cartItem.upsert({
      where: { userId_variantId: { userId, variantId: line.variantId } },
      create: { userId, variantId: line.variantId, quantity },
      update: { quantity },
    });
  }
}
