import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

// Minimal Razorpay client using the REST API (no SDK needed).
// Docs: https://razorpay.com/docs/api/orders/ and https://razorpay.com/docs/payments/server-integration/nodejs/

export function razorpayEnabled() {
  return env.razorpay.configured;
}

export async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>) {
  const auth = Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { id: string; amount: number; currency: string };
  return data;
}

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Verify the signature returned to the browser by Razorpay Checkout. */
export function verifyPaymentSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  const expected = createHmac("sha256", env.razorpay.keySecret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Verify a webhook request body against the X-Razorpay-Signature header. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!env.razorpay.webhookSecret || !signature) return false;
  const expected = createHmac("sha256", env.razorpay.webhookSecret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
