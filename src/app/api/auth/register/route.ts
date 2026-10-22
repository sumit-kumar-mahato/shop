import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, limitByIp, ok, parseJson, route } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { mergeGuestCart } from "@/lib/cart";
import { cartLineSchema, emailSchema, nameSchema, passwordSchema } from "@/lib/validators";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(20).optional(),
  newsletter: z.boolean().optional(),
  guestCart: z.array(cartLineSchema).max(50).optional(),
});

export const POST = route(async (req) => {
  await limitByIp(req, "register", 10, 3600);
  const input = await parseJson(req, schema);

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists. Try signing in instead.", { email: "Already registered" });
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      passwordHash: await hashPassword(input.password),
    },
  });

  if (input.newsletter) {
    await prisma.newsletterSubscriber.upsert({ where: { email: user.email }, create: { email: user.email }, update: { isActive: true } });
  }

  await createSession(user);
  if (input.guestCart?.length) await mergeGuestCart(user.id, input.guestCart);

  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION", 24 * 60);
  await sendVerificationEmail(user.email, user.name, token);

  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
});
