import { NextResponse } from "next/server";
import { route } from "@/lib/api";
import { markOrderPaid, recordPaymentFailure } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

// Razorpay → server notification. Configure in Razorpay Dashboard → Webhooks with events:
// payment.captured, order.paid, payment.failed
export const POST = route(
  async (req) => {
    const raw = await req.text();
    if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(raw) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string; error_description?: string } } };
    };
    const payment = event.payload?.payment?.entity;

    if (payment?.order_id) {
      if (event.event === "payment.captured" || event.event === "order.paid") {
        await markOrderPaid(payment.order_id, payment.id, "webhook");
      } else if (event.event === "payment.failed") {
        await recordPaymentFailure(payment.order_id, payment.error_description ?? "Payment failed");
      }
    }
    return NextResponse.json({ received: true });
  },
  { skipOriginCheck: true },
);
