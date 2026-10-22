import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { revokeUserSessions } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validators";

const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: passwordSchema });

export const POST = route(async (req) => {
  const user = await requireUser();
  const limit = await rateLimit(`password:user:${user.id}`, 10, 3600);
  if (!limit.ok) throw new ApiError(429, "Too many attempts. Please try again later.");

  const { currentPassword, newPassword } = await parseJson(req, schema);
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(currentPassword, record.passwordHash))) {
    throw new ApiError(400, "Your current password is incorrect.", { currentPassword: "Incorrect password" });
  }
  if (currentPassword === newPassword) throw new ApiError(400, "Choose a password different from your current one.");

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  // Sign out every other device.
  await revokeUserSessions(user.id, user.sessionId);
  return ok({ success: true });
});
