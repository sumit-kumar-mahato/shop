import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, limitByIp, ok, parseJson, route } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { mergeGuestCart } from "@/lib/cart";
import { cartLineSchema, emailSchema } from "@/lib/validators";

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
  guestCart: z.array(cartLineSchema).max(50).optional(),
});

export const POST = route(async (req) => {
  await limitByIp(req, "login", 30, 15 * 60);
  const input = await parseJson(req, schema);

  // Per-account limit protects against password guessing spread across many IPs.
  const accountKey = `login:email:${input.email}`;
  const accountLimit = await rateLimit(accountKey, 8, 15 * 60);
  if (!accountLimit.ok) {
    throw new ApiError(429, "Too many failed attempts for this account. Please wait 15 minutes or reset your password.");
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await verifyPassword(input.password, user?.passwordHash);
  if (!user || !valid) throw new ApiError(401, "Incorrect email or password.");
  if (!user.isActive) throw new ApiError(403, "This account has been disabled. Please contact the store.");

  await resetRateLimit(accountKey);
  await createSession(user);
  if (input.guestCart?.length) await mergeGuestCart(user.id, input.guestCart);

  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
