import type { Gender, OrderStatus, PaymentStatus, PaymentMethod, Role } from "@prisma/client";

export const GENDER_LABELS: Record<Gender, string> = {
  MEN: "Men",
  WOMEN: "Women",
  KIDS: "Kids",
  UNISEX: "Unisex",
};

export const GENDER_FROM_PARAM: Record<string, Gender> = {
  men: "MEN",
  women: "WOMEN",
  kids: "KIDS",
  unisex: "UNISEX",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  RAZORPAY: "Online (UPI / Card / Netbanking)",
};

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  STAFF: "Staff",
  ADMIN: "Administrator",
};

/** Which status changes staff are allowed to make from each status. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: ["RETURN_REQUESTED", "RETURNED"],
  RETURN_REQUESTED: ["RETURNED", "DELIVERED"],
  CANCELLED: [],
  RETURNED: [],
};

/** Statuses in which the customer can still cancel the order themselves. */
export const CUSTOMER_CANCELLABLE: OrderStatus[] = ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING"];

/** Orders in these statuses count towards revenue. */
export const REVENUE_STATUSES: OrderStatus[] = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURN_REQUESTED",
];

/** Progress steps shown on the customer's order tracker. */
export const TRACKING_STEPS: OrderStatus[] = ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export const MAX_QTY_PER_LINE = 10;
export const PENDING_PAYMENT_TTL_MINUTES = 30;
export const PRODUCTS_PER_PAGE = 24;
export const SESSION_COOKIE = "pkm_session";
/** Request header the middleware sets for admin live-preview requests (`?pkm_preview=1`). */
export const PREVIEW_HEADER = "x-pkm-preview";

/** Homepage placement flags on products (shown in homepage sections and product blocks). */
export const PRODUCT_FLAGS = {
  isNewArrival: "New arrival",
  isBestSeller: "Best seller",
  isFeatured: "Featured",
  isTrending: "Trending",
  isFlashSale: "Flash sale",
} as const;
export type ProductFlag = keyof typeof PRODUCT_FLAGS;
