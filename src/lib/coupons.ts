import "server-only";
import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/money";
import type { CouponRule } from "@/lib/pricing";

export type CouponCheck = { ok: true; coupon: Coupon; rule: CouponRule } | { ok: false; message: string };

/**
 * Validate a coupon for a cart subtotal. Per-user limits are checked only when a userId is given
 * (guests see the discount in the cart; it is re-validated at checkout once they sign in).
 */
export async function checkCoupon(code: string, subtotal: number, userId?: string | null): Promise<CouponCheck> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, message: "Enter a coupon code." };
  const coupon = await prisma.coupon.findUnique({ where: { code: normalized } });
  const now = new Date();

  if (!coupon || !coupon.isActive) return { ok: false, message: "This coupon code is not valid." };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, message: "This coupon is not active yet." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, message: "This coupon has expired." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.minOrderAmount) {
    return { ok: false, message: `Add items worth ${formatINR(coupon.minOrderAmount - subtotal)} more to use this coupon.` };
  }
  if (userId && coupon.perUserLimit != null) {
    const used = await prisma.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (used >= coupon.perUserLimit) return { ok: false, message: "You have already used this coupon." };
  }

  return {
    ok: true,
    coupon,
    rule: { type: coupon.type, value: coupon.value, minOrderAmount: coupon.minOrderAmount, maxDiscount: coupon.maxDiscount },
  };
}

export function describeCoupon(c: Pick<Coupon, "type" | "value" | "maxDiscount" | "minOrderAmount">): string {
  const amount = c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatINR(c.value)} off`;
  const cap = c.type === "PERCENTAGE" && c.maxDiscount ? ` (up to ${formatINR(c.maxDiscount)})` : "";
  const min = c.minOrderAmount > 0 ? ` on orders above ${formatINR(c.minOrderAmount)}` : "";
  return `${amount}${cap}${min}`;
}
