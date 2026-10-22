// Types shared between server code and client components.
import type { Totals } from "@/lib/pricing";

export type CartLineIssue = "OUT_OF_STOCK" | "QUANTITY_REDUCED" | "UNAVAILABLE";

export type QuoteLine = {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  size: string;
  color: string;
  sku: string;
  unitPrice: number;
  compareAtPrice: number | null;
  quantity: number;
  maxQuantity: number;
  lineTotal: number;
  issue: CartLineIssue | null;
};

export type CartQuote = {
  lines: QuoteLine[];
  totals: Totals;
  coupon: { code: string; applied: boolean; message: string | null; discount: number } | null;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  hasIssues: boolean;
};

export type ProductCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  hoverImage: string | null;
  categoryName: string | null;
  ratingAvg: number;
  ratingCount: number;
  totalStock: number;
  colors: Array<{ name: string; hex: string | null }>;
  quickAddVariantId: string | null; // set only when the product has exactly one purchasable variant
  isNewArrival: boolean;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  emailVerified: boolean;
} | null;
