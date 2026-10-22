import { z } from "zod";
import { ok, parseJson, route } from "@/lib/api";
import { quoteCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth/session";
import { cartLineSchema } from "@/lib/validators";

const schema = z.object({
  lines: z.array(cartLineSchema).max(50),
  coupon: z.string().trim().max(30).nullable().optional(),
});

/** Price a guest (browser-stored) cart with live prices and stock. */
export const POST = route(async (req) => {
  const { lines, coupon } = await parseJson(req, schema);
  const user = await getCurrentUser();
  return ok(await quoteCart(lines, coupon, user?.id));
});
