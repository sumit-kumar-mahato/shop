import { z } from "zod";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { placeOrder } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  addressId: z.string().min(1).max(40),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  couponCode: z.string().trim().max(30).nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const limit = await rateLimit(`checkout:user:${user.id}`, 10, 600);
  if (!limit.ok) throw new ApiError(429, "Too many order attempts. Please wait a few minutes.");

  const input = await parseJson(req, schema);
  const result = await placeOrder({ user, ...input });
  return ok({
    ...result,
    prefill: { name: user.name, email: user.email, contact: user.phone ?? "" },
  });
});
