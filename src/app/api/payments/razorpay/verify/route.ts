import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { markOrderPaid, recordPaymentFailure } from "@/lib/orders";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

const schema = z.object({
  orderNumber: z.string().min(1).max(40),
  razorpay_order_id: z.string().min(1).max(60),
  razorpay_payment_id: z.string().min(1).max(60),
  razorpay_signature: z.string().min(1).max(200),
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, schema);

  const order = await prisma.order.findUnique({ where: { orderNumber: input.orderNumber } });
  if (!order || order.userId !== user.id || order.razorpayOrderId !== input.razorpay_order_id) {
    throw new ApiError(404, "Order not found.");
  }
  if (!verifyPaymentSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    await recordPaymentFailure(input.razorpay_order_id, "Signature verification failed");
    throw new ApiError(400, "We could not verify this payment. If money was deducted, it will be refunded automatically — or contact us.");
  }

  await markOrderPaid(input.razorpay_order_id, input.razorpay_payment_id, "checkout");
  return ok({ success: true, orderNumber: order.orderNumber });
});
