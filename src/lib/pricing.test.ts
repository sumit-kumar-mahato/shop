import { describe, expect, it } from "vitest";
import { amountToFreeShipping, computeDiscount, computeTotals, type PricingConfig } from "./pricing";

const inclusive: PricingConfig = { flatShippingFee: 9900, freeShippingThreshold: 199900, taxRatePercent: 5, pricesIncludeTax: true };
const exclusive: PricingConfig = { ...inclusive, pricesIncludeTax: false, taxRatePercent: 12 };

describe("computeDiscount", () => {
  it("applies percentage discounts and floors to whole paise", () => {
    expect(computeDiscount(99999, { type: "PERCENTAGE", value: 10, minOrderAmount: 0, maxDiscount: null })).toBe(9999);
  });

  it("caps percentage discounts at maxDiscount", () => {
    expect(computeDiscount(1_000_000, { type: "PERCENTAGE", value: 50, minOrderAmount: 0, maxDiscount: 100_000 })).toBe(100_000);
  });

  it("never discounts more than the subtotal", () => {
    expect(computeDiscount(50_000, { type: "FIXED", value: 100_000, minOrderAmount: 0, maxDiscount: null })).toBe(50_000);
  });

  it("returns 0 below the minimum order amount", () => {
    expect(computeDiscount(50_000, { type: "FIXED", value: 10_000, minOrderAmount: 100_000, maxDiscount: null })).toBe(0);
  });
});

describe("computeTotals", () => {
  it("charges shipping below the free-shipping threshold", () => {
    const t = computeTotals([{ unitPrice: 129900, quantity: 1 }], null, inclusive);
    expect(t.shippingFee).toBe(9900);
    expect(t.total).toBe(129900 + 9900);
  });

  it("gives free shipping at or above the threshold", () => {
    const t = computeTotals([{ unitPrice: 99950, quantity: 2 }], null, inclusive);
    expect(t.subtotal).toBe(199900);
    expect(t.shippingFee).toBe(0);
  });

  it("uses the post-discount amount for the free-shipping check", () => {
    const t = computeTotals([{ unitPrice: 200000, quantity: 1 }], { type: "FIXED", value: 10000, minOrderAmount: 0, maxDiscount: null }, inclusive);
    expect(t.shippingFee).toBe(9900);
    expect(t.total).toBe(200000 - 10000 + 9900);
  });

  it("extracts included GST without changing the total", () => {
    const t = computeTotals([{ unitPrice: 210000, quantity: 1 }], null, inclusive);
    expect(t.tax).toBe(10000);
    expect(t.total).toBe(210000);
  });

  it("adds GST on top when prices exclude tax", () => {
    const t = computeTotals([{ unitPrice: 100000, quantity: 1 }], null, exclusive);
    expect(t.tax).toBe(12000);
    expect(t.total).toBe(100000 + 12000 + 9900);
  });

  it("returns zeros for an empty cart", () => {
    const t = computeTotals([], null, inclusive);
    expect(t).toMatchObject({ itemCount: 0, subtotal: 0, shippingFee: 0, total: 0 });
  });
});

describe("amountToFreeShipping", () => {
  it("reports the remaining amount", () => {
    expect(amountToFreeShipping(150000, inclusive)).toBe(49900);
    expect(amountToFreeShipping(250000, inclusive)).toBe(0);
  });
});
