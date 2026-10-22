import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, limitByIp, ok, parseJson, route } from "@/lib/api";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import { passwordSchema } from "@/lib/validators";

const schema = z.object({ token: z.string().min(10).max(200), password: passwordSchema });

export const POST = route(async (req) => {
  await limitByIp(req, "reset", 20, 3600);
  const { token, password } = await parseJson(req, schema);
  const userId = await consumeAuthToken(token, "PASSWORD_RESET");
  if (!userId) throw new ApiError(400, "This reset link is invalid or has expired. Please request a new one.");

  await prisma.user.update({
    where: { id: userId },
    // Receiving the email proves ownership of the address.
    data: { passwordHash: await hashPassword(password), emailVerifiedAt: new Date() },
  });
  await revokeUserSessions(userId);
  return ok({ success: true });
});
