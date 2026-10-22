// Pure pricing logic shared by cart quotes and order placement. All amounts in paise.

export type PricingLine = { unitPrice: number; quantity: number };

export type CouponRule = {
  type: "PERCENTAGE" | "FIXED";
  value: number; // percent, or paise for FIXED
  minOrderAmount: number;
  maxDiscount: number | null;
};

export type PricingConfig = {
  flatShippingFee: number;
  freeShippingThreshold: number; // 0 disables free shipping
  taxRatePercent: number;
  pricesIncludeTax: boolean;
};

export type Totals = {
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  taxIncluded: boolean;
  total: number;
};

export function computeDiscount(subtotal: number, coupon: CouponRule | null): number {
  if (!coupon || subtotal <= 0 || subtotal < coupon.minOrderAmount) return 0;
  let discount =
    coupon.type === "PERCENTAGE" ? Math.floor((subtotal * Math.min(coupon.value, 100)) / 100) : coupon.value;
  if (coupon.maxDiscount != null && coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  return Math.max(0, Math.min(discount, subtotal));
}

export function computeShipping(amountAfterDiscount: number, config: PricingConfig, itemCount: number): number {
  if (itemCount === 0) return 0;
  if (config.freeShippingThreshold > 0 && amountAfterDiscount >= config.freeShippingThreshold) return 0;
  return config.flatShippingFee;
}

export function computeTotals(lines: PricingLine[], coupon: CouponRule | null, config: PricingConfig): Totals {
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discount = computeDiscount(subtotal, coupon);
  const afterDiscount = subtotal - discount;
  const shippingFee = computeShipping(afterDiscount, config, itemCount);
  const rate = Math.max(0, config.taxRatePercent);

  let tax: number;
  let total: number;
  if (config.pricesIncludeTax) {
    // Prices already include GST; report the GST component for the invoice.
    tax = Math.round((afterDiscount * rate) / (100 + rate));
    total = afterDiscount + shippingFee;
  } else {
    tax = Math.round((afterDiscount * rate) / 100);
    total = afterDiscount + tax + shippingFee;
  }

  return { itemCount, subtotal, discount, shippingFee, tax, taxIncluded: config.pricesIncludeTax, total };
}

export function amountToFreeShipping(subtotalAfterDiscount: number, config: PricingConfig): number {
  if (config.freeShippingThreshold <= 0 || config.flatShippingFee === 0) return 0;
  return Math.max(0, config.freeShippingThreshold - subtotalAfterDiscount);
}
