import { z } from "zod";
import { prisma } from "@/lib/db";
import { limitByIp, ok, parseJson, route } from "@/lib/api";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";
import { emailSchema } from "@/lib/validators";

const schema = z.object({ email: emailSchema });

// Always responds the same way so it can't be used to discover which emails have accounts.
export const POST = route(async (req) => {
  await limitByIp(req, "forgot", 10, 3600);
  const { email } = await parseJson(req, schema);
  const perEmail = await rateLimit(`forgot:email:${email}`, 3, 3600);

  if (perEmail.ok) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const token = await createAuthToken(user.id, "PASSWORD_RESET", 60);
      await sendPasswordResetEmail(user.email, user.name, token);
    }
  }
  return ok({ success: true });
});
