import { prisma } from "@/lib/db";
import { ApiError, ok, requireUser, route } from "@/lib/api";
import { env } from "@/lib/env";
import { createRazorpayOrder, razorpayEnabled } from "@/lib/payments/razorpay";

/** Retry payment for an order that is still awaiting online payment. */
export const POST = route<{ params: { orderNumber: string } }>(async (_req, { params }) => {
  const user = await requireUser();
  const order = await prisma.order.findUnique({ where: { orderNumber: params.orderNumber } });
  if (!order || order.userId !== user.id) throw new ApiError(404, "Order not found.");
  if (order.status !== "PENDING_PAYMENT" || order.paymentStatus === "PAID") throw new ApiError(400, "This order does not need payment.");
  if (!razorpayEnabled()) throw new ApiError(400, "Online payment is not available right now.");

  let razorpayOrderId = order.razorpayOrderId;
  if (!razorpayOrderId) {
    const rzp = await createRazorpayOrder(order.total, order.orderNumber, { orderNumber: order.orderNumber, userId: user.id });
    razorpayOrderId = rzp.id;
    await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId } });
  }
  return ok({
    orderNumber: order.orderNumber,
    razorpay: { keyId: env.razorpay.keyId, orderId: razorpayOrderId, amount: order.total, currency: "INR" },
    prefill: { name: user.name, email: user.email, contact: order.phone },
  });
});
