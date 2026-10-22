// Server-side validation for admin panel input.
import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

export const imageUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v.startsWith("/api/images/") || v.startsWith("/") || /^https:\/\//i.test(v), "Image must be uploaded or an https:// link");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

const paise = z.number().int().min(0).max(100_000_000);

export const variantInputSchema = z.object({
  id: z.string().max(40).optional(),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "SKU is required")
    .max(60)
    .regex(/^[A-Z0-9._-]+$/, "SKU may only contain letters, numbers, dot, dash and underscore"),
  size: z.string().trim().min(1, "Size is required").max(30),
  color: z.string().trim().min(1, "Color is required").max(40),
  colorHex: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #000000")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  stock: z.number().int().min(0).max(1_000_000),
  price: paise.nullable().optional(),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    slug: slugSchema,
    description: z.string().trim().max(10000),
    categoryId: z.string().max(40).nullable().optional(),
    gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
    price: paise.min(100, "Price must be at least ₹1"),
    compareAtPrice: paise.nullable().optional(),
    images: z.array(imageUrlSchema).max(12),
    fabric: optionalText(120),
    fit: optionalText(120),
    careInstructions: optionalText(500),
    tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(20),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),
    isNewArrival: z.boolean(),
    isBestSeller: z.boolean(),
    isTrending: z.boolean(),
    isFlashSale: z.boolean(),
    seoTitle: optionalText(120),
    seoDescription: optionalText(300),
    variants: z.array(variantInputSchema).min(1, "Add at least one size/color variant").max(150),
  })
  .superRefine((p, ctx) => {
    if (p.compareAtPrice != null && p.compareAtPrice > 0 && p.compareAtPrice <= p.price) {
      ctx.addIssue({ code: "custom", path: ["compareAtPrice"], message: "Original price must be higher than the selling price" });
    }
    if (p.status === "ACTIVE" && p.images.length === 0) {
      ctx.addIssue({ code: "custom", path: ["images"], message: "Add at least one image before publishing" });
    }
    const combos = new Set<string>();
    const skus = new Set<string>();
    p.variants.forEach((v, i) => {
      const combo = `${v.size.toLowerCase()}|${v.color.toLowerCase()}`;
      if (combos.has(combo)) ctx.addIssue({ code: "custom", path: ["variants", i, "size"], message: `Duplicate variant ${v.size} / ${v.color}` });
      combos.add(combo);
      if (skus.has(v.sku)) ctx.addIssue({ code: "custom", path: ["variants", i, "sku"], message: `Duplicate SKU ${v.sku}` });
      skus.add(v.sku);
    });
  });
export type ProductInput = z.infer<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: slugSchema,
  description: optionalText(300),
  image: imageUrlSchema.nullable().optional().or(z.literal("").transform(() => null)),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
});

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, dashes or underscores"),
    description: optionalText(200),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    value: z.number().int().min(1),
    minOrderAmount: paise.default(0),
    maxDiscount: paise.nullable().optional(),
    startsAt: z.string().datetime({ offset: true }).nullable().optional().or(z.literal("").transform(() => null)),
    expiresAt: z.string().datetime({ offset: true }).nullable().optional().or(z.literal("").transform(() => null)),
    usageLimit: z.number().int().min(1).nullable().optional(),
    perUserLimit: z.number().int().min(1).nullable().optional(),
    isActive: z.boolean(),
    isPublic: z.boolean(),
  })
  .superRefine((c, ctx) => {
    if (c.type === "PERCENTAGE" && c.value > 90) ctx.addIssue({ code: "custom", path: ["value"], message: "Percentage must be between 1 and 90" });
    if (c.startsAt && c.expiresAt && new Date(c.expiresAt) <= new Date(c.startsAt)) {
      ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Expiry must be after the start date" });
    }
  });

export function couponData(input: z.infer<typeof couponInputSchema>) {
  return {
    ...input,
    maxDiscount: input.type === "PERCENTAGE" ? input.maxDiscount ?? null : null,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    usageLimit: input.usageLimit ?? null,
    perUserLimit: input.perUserLimit ?? null,
  };
}

export const blogInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  slug: slugSchema,
  excerpt: z.string().trim().min(10).max(400),
  content: z.string().trim().min(20).max(50000),
  coverImage: imageUrlSchema.nullable().optional().or(z.literal("").transform(() => null)),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(10),
  authorName: z.string().trim().min(2).max(80),
  readMinutes: z.number().int().min(1).max(120),
  isPublished: z.boolean(),
});

export const orderUpdateSchema = z.object({
  status: z
    .enum(["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURN_REQUESTED", "RETURNED"])
    .optional(),
  note: z.string().trim().max(500).nullable().optional(),
  courierName: z.string().trim().max(80).nullable().optional(),
  trackingNumber: z.string().trim().max(80).nullable().optional(),
  trackingUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Tracking link must start with http(s)://")
    .nullable()
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  adminNote: z.string().trim().max(2000).nullable().optional(),
  restockOnReturn: z.boolean().optional(),
  notifyCustomer: z.boolean().optional(),
});
