import "server-only";
import { randomInt } from "node:crypto";
import { Prisma, type Order, type OrderItem, type OrderStatus, type PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { getUserCartLines, quoteCart } from "@/lib/cart";
import { createRazorpayOrder, razorpayEnabled } from "@/lib/payments/razorpay";
import { env } from "@/lib/env";
import { sendOrderConfirmation, sendOrderStatusEmail } from "@/lib/mail";
import { CUSTOMER_CANCELLABLE, ORDER_STATUS_LABELS, ORDER_TRANSITIONS, PENDING_PAYMENT_TTL_MINUTES } from "@/lib/constants";
import type { CurrentUser } from "@/lib/auth/session";

type Tx = Prisma.TransactionClient;

const ORDER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateOrderNumber() {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let code = "";
  for (let i = 0; i < 5; i++) code += ORDER_CODE_ALPHABET[randomInt(ORDER_CODE_ALPHABET.length)];
  return `PKM-${date}-${code}`;
}

export type PlaceOrderInput = {
  user: CurrentUser;
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  note?: string | null;
};

export type PlaceOrderResult = {
  orderNumber: string;
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
};

/**
 * Create an order from the user's saved cart. Prices, discounts and stock are re-validated on the server,
 * and stock is reserved atomically inside a transaction so two customers can never buy the last item twice.
 */
export async function placeOrder({ user, addressId, paymentMethod, couponCode, note }: PlaceOrderInput): Promise<PlaceOrderResult> {
  await expireStalePendingOrders();

  const store = await getSettings("store");
  if (store.orders.requireEmailVerification && !user.emailVerified) {
    throw new ApiError(403, "Please verify your email address before placing an order.");
  }

  const address = await prisma.address.findFirst({ where: { id: addressId, userId: user.id } });
  if (!address) throw new ApiError(400, "Please choose a delivery address.");

  const cartLines = await getUserCartLines(user.id);
  if (cartLines.length === 0) throw new ApiError(400, "Your bag is empty.");

  const quote = await quoteCart(cartLines, couponCode, user.id);
  if (quote.hasIssues) {
    throw new ApiError(409, "Some items in your bag have changed (price, stock or availability). Please review your bag and try again.");
  }
  if (quote.lines.length === 0) throw new ApiError(400, "Your bag is empty.");
  if (couponCode && !quote.coupon?.applied) throw new ApiError(400, quote.coupon?.message ?? "This coupon cannot be applied.");

  const { totals } = quote;
  if (paymentMethod === "COD") {
    if (!store.payments.codEnabled) throw new ApiError(400, "Cash on Delivery is not available right now.");
    if (store.payments.codMaxOrderValue > 0 && totals.total > store.payments.codMaxOrderValue) {
      throw new ApiError(400, "Cash on Delivery is not available for orders of this value. Please pay online.");
    }
  } else if (!store.payments.onlineEnabled || !razorpayEnabled()) {
    throw new ApiError(400, "Online payment is not available right now.");
  }

  const coupon = quote.coupon?.applied ? await prisma.coupon.findUnique({ where: { code: quote.coupon.code } }) : null;
  const isOnline = paymentMethod === "RAZORPAY";
  const initialStatus: OrderStatus = isOnline ? "PENDING_PAYMENT" : "CONFIRMED";

  let order: (Order & { items: OrderItem[] }) | null = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const line of quote.lines) {
          const reserved = await tx.productVariant.updateMany({
            where: { id: line.variantId, isActive: true, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (reserved.count !== 1) {
            throw new ApiError(409, `Sorry, "${line.title}" (${line.size} / ${line.color}) just sold out. Please update your bag.`);
          }
        }

        if (coupon) {
          const claimed = await tx.coupon.updateMany({
            where: { id: coupon.id, isActive: true, ...(coupon.usageLimit != null ? { usageCount: { lt: coupon.usageLimit } } : {}) },
            data: { usageCount: { increment: 1 } },
          });
          if (claimed.count !== 1) throw new ApiError(409, "This coupon has just reached its usage limit.");
        }

        const created = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: user.id,
            email: user.email,
            phone: address.phone,
            shippingName: address.fullName,
            shippingLine1: address.line1,
            shippingLine2: address.line2,
            shippingLandmark: address.landmark,
            shippingCity: address.city,
            shippingState: address.state,
            shippingPostal: address.postalCode,
            shippingCountry: address.country,
            subtotal: totals.subtotal,
            discount: totals.discount,
            shippingFee: totals.shippingFee,
            tax: totals.tax,
            taxIncluded: totals.taxIncluded,
            total: totals.total,
            couponId: coupon?.id,
            couponCode: coupon?.code,
            paymentMethod,
            paymentStatus: "PENDING",
            status: initialStatus,
            customerNote: note || null,
            items: {
              create: quote.lines.map((l) => ({
                productId: l.productId,
                variantId: l.variantId,
                title: l.title,
                sku: l.sku,
                size: l.size,
                color: l.color,
                image: l.image,
                unitPrice: l.unitPrice,
                quantity: l.quantity,
                lineTotal: l.unitPrice * l.quantity,
              })),
            },
            events: {
              create: {
                status: initialStatus,
                note: isOnline ? "Order created — awaiting online payment." : "Order placed with Cash on Delivery.",
                actor: "customer",
              },
            },
          },
          include: { items: true },
        });

        if (coupon) await tx.couponRedemption.create({ data: { couponId: coupon.id, userId: user.id, orderId: created.id } });
        await adjustSalesCount(tx, quote.lines, +1);
        if (!isOnline) await tx.cartItem.deleteMany({ where: { userId: user.id } });
        return created;
      }, { timeout: 20_000, maxWait: 10_000 });
    } catch (err) {
      const isOrderNumberClash =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && String(err.meta?.target).includes("orderNumber");
      if (!isOrderNumberClash || attempt === 2) throw err;
    }
  }
  if (!order) throw new ApiError(500, "Could not create the order. Please try again.");

  if (!isOnline) {
    await sendOrderConfirmation(order);
    return { orderNumber: order.orderNumber };
  }

  try {
    const rzp = await createRazorpayOrder(order.total, order.orderNumber, { orderNumber: order.orderNumber, userId: user.id });
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzp.id } });
    return { orderNumber: order.orderNumber, razorpay: { keyId: env.razorpay.keyId, orderId: rzp.id, amount: rzp.amount, currency: rzp.currency } };
  } catch (err) {
    console.error("[orders] razorpay order creation failed", err);
    await cancelOrder(order.id, { actor: "system", note: "Payment gateway unavailable." });
    throw new ApiError(502, "The payment gateway is not responding. Please try again or choose Cash on Delivery.");
  }
}

async function adjustSalesCount(tx: Tx, lines: Array<{ productId: string | null; quantity: number }>, sign: 1 | -1) {
  const perProduct = new Map<string, number>();
  for (const l of lines) if (l.productId) perProduct.set(l.productId, (perProduct.get(l.productId) ?? 0) + l.quantity);
  for (const [productId, qty] of perProduct) {
    await tx.product.updateMany({ where: { id: productId }, data: { salesCount: { increment: sign * qty } } });
  }
}

async function restock(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (item.variantId) {
      await tx.productVariant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
    }
  }
  await adjustSalesCount(tx, items, -1);
}

async function releaseCoupon(tx: Tx, orderId: string) {
  const redemption = await tx.couponRedemption.findUnique({ where: { orderId } });
  if (!redemption) return;
  await tx.couponRedemption.delete({ where: { id: redemption.id } });
  await tx.coupon.updateMany({ where: { id: redemption.couponId, usageCount: { gt: 0 } }, data: { usageCount: { decrement: 1 } } });
}

type Actor = { actor: string; note?: string | null };

/** Cancel an order, return its stock and release its coupon. Safe to call twice. */
export async function cancelOrder(orderId: string, { actor, note }: Actor, allowedFrom: OrderStatus[] = ORDER_TRANSITIONS_TO_CANCEL) {
  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.order.updateMany({
      where: { id: orderId, status: { in: allowedFrom } },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    if (changed.count !== 1) return null;
    await restock(tx, orderId);
    await releaseCoupon(tx, orderId);
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    let eventNote = note ?? null;
    if (order.paymentStatus === "PAID") {
      eventNote = `${eventNote ? `${eventNote} ` : ""}Refund of the online payment is required.`;
      await tx.order.update({
        where: { id: orderId },
        data: { adminNote: [order.adminNote, "⚠ Paid online — issue a refund from the Razorpay dashboard, then mark the payment as Refunded."].filter(Boolean).join("\n") },
      });
    }
    await tx.orderEvent.create({ data: { orderId, status: "CANCELLED", note: eventNote, actor } });
    return order;
  });
  return result;
}

const ORDER_TRANSITIONS_TO_CANCEL: OrderStatus[] = (Object.keys(ORDER_TRANSITIONS) as OrderStatus[]).filter((s) =>
  ORDER_TRANSITIONS[s].includes("CANCELLED"),
);

export async function cancelOrderByCustomer(orderNumber: string, userId: string, reason: string | null) {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.userId !== userId) throw new ApiError(404, "Order not found.");
  if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
    throw new ApiError(400, "This order can no longer be cancelled. Please contact us for help.");
  }
  const cancelled = await cancelOrder(order.id, { actor: "customer", note: reason ? `Cancelled by customer: ${reason}` : "Cancelled by customer." }, CUSTOMER_CANCELLABLE);
  if (!cancelled) throw new ApiError(409, "This order was updated in the meantime. Please refresh.");
  await sendOrderStatusEmail({ ...cancelled, status: "CANCELLED" });
}

/** Mark an online order paid (from checkout verification or webhook). Idempotent. */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string, source: string) {
  const outcome = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { razorpayOrderId }, include: { items: true } });
    if (!order) return null;
    if (order.paymentStatus === "PAID") return { order, newlyConfirmed: false };

    const wasPending = order.status === "PENDING_PAYMENT";
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paidAt: new Date(),
        razorpayPaymentId,
        ...(wasPending ? { status: "CONFIRMED" } : {}),
        ...(order.status === "CANCELLED"
          ? { adminNote: [order.adminNote, "⚠ Payment received after the order was cancelled — refund required."].filter(Boolean).join("\n") }
          : {}),
      },
      include: { items: true },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        status: updated.status,
        note: wasPending ? `Payment received (${source}).` : `Payment received after cancellation (${source}) — refund required.`,
        actor: "system",
      },
    });
    if (wasPending && order.userId) {
      const variantIds = order.items.map((i) => i.variantId).filter((v): v is string => Boolean(v));
      await tx.cartItem.deleteMany({ where: { userId: order.userId, variantId: { in: variantIds } } });
    }
    return { order: updated, newlyConfirmed: wasPending };
  });
  if (outcome?.newlyConfirmed) await sendOrderConfirmation(outcome.order);
  return outcome?.order ?? null;
}

export async function recordPaymentFailure(razorpayOrderId: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order || order.paymentStatus !== "PENDING") return;
  await prisma.orderEvent.create({
    data: { orderId: order.id, status: order.status, note: `Payment attempt failed: ${reason.slice(0, 200)}`, actor: "system" },
  });
}

/** Cancel online orders whose payment was never completed, returning their stock. */
export async function expireStalePendingOrders() {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_TTL_MINUTES * 60_000);
  const stale = await prisma.order.findMany({
    where: { status: "PENDING_PAYMENT", paymentStatus: { not: "PAID" }, createdAt: { lt: cutoff } },
    select: { id: true },
    take: 25,
  });
  for (const o of stale) {
    await cancelOrder(o.id, { actor: "system", note: "Payment was not completed in time." }, ["PENDING_PAYMENT"]);
  }
}

export type StatusUpdate = {
  status?: OrderStatus;
  note?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  restockOnReturn?: boolean;
  notifyCustomer?: boolean;
};

/** Staff update of order status / shipment details with transition rules enforced. */
export async function updateOrderByStaff(orderId: string, staffName: string, update: StatusUpdate) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "Order not found.");

  const shipping = {
    ...(update.courierName !== undefined ? { courierName: update.courierName || null } : {}),
    ...(update.trackingNumber !== undefined ? { trackingNumber: update.trackingNumber || null } : {}),
    ...(update.trackingUrl !== undefined ? { trackingUrl: update.trackingUrl || null } : {}),
  };

  const next = update.status && update.status !== order.status ? update.status : null;
  if (next && !ORDER_TRANSITIONS[order.status].includes(next)) {
    throw new ApiError(400, `An order that is "${ORDER_STATUS_LABELS[order.status]}" cannot be changed to "${ORDER_STATUS_LABELS[next]}".`);
  }

  if (next === "CANCELLED") {
    if (Object.keys(shipping).length) await prisma.order.update({ where: { id: orderId }, data: shipping });
    const cancelled = await cancelOrder(orderId, { actor: staffName, note: update.note || "Cancelled by store." });
    if (!cancelled) throw new ApiError(409, "This order was updated in the meantime. Please refresh.");
    if (update.notifyCustomer) await sendOrderStatusEmail({ ...cancelled, status: "CANCELLED" }, update.note);
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (next) {
      const changed = await tx.order.updateMany({ where: { id: orderId, status: order.status }, data: { status: next } });
      if (changed.count !== 1) throw new ApiError(409, "This order was updated in the meantime. Please refresh.");
    }
    const extra: Prisma.OrderUpdateInput = { ...shipping };
    if (next === "DELIVERED") {
      extra.deliveredAt = new Date();
      if (order.paymentMethod === "COD" && order.paymentStatus === "PENDING") {
        extra.paymentStatus = "PAID";
        extra.paidAt = new Date();
      }
    }
    if (next === "RETURNED" && update.restockOnReturn) await restock(tx, orderId);
    const saved = await tx.order.update({ where: { id: orderId }, data: extra });
    if (next || update.note) {
      await tx.orderEvent.create({ data: { orderId, status: saved.status, note: update.note || null, actor: staffName } });
    }
    return saved;
  });

  if (next && update.notifyCustomer) await sendOrderStatusEmail(updated, update.note);
}

export async function requestReturn(orderNumber: string, userId: string, reason: string) {
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.userId !== userId) throw new ApiError(404, "Order not found.");
  if (order.status !== "DELIVERED") throw new ApiError(400, "Only delivered orders can be returned.");
  const store = await getSettings("store");
  const deliveredAt = order.deliveredAt ?? order.updatedAt;
  const deadline = deliveredAt.getTime() + store.orders.returnWindowDays * 86_400_000;
  if (store.orders.returnWindowDays === 0 || Date.now() > deadline) {
    throw new ApiError(400, "The return window for this order has closed. Please contact us for help.");
  }
  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: "RETURN_REQUESTED", returnReason: reason } }),
    prisma.orderEvent.create({ data: { orderId: order.id, status: "RETURN_REQUESTED", note: `Return requested: ${reason}`, actor: "customer" } }),
  ]);
}
