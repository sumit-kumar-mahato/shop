import { ApiError, ok, requireUser, route } from "@/lib/api";
import { createAuthToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit } from "@/lib/rate-limit";

export const POST = route(async () => {
  const user = await requireUser();
  if (user.emailVerified) return ok({ success: true, alreadyVerified: true });
  const limit = await rateLimit(`verify:user:${user.id}`, 3, 3600);
  if (!limit.ok) throw new ApiError(429, "Please wait a while before requesting another email.");
  const token = await createAuthToken(user.id, "EMAIL_VERIFICATION", 24 * 60);
  await sendVerificationEmail(user.email, user.name, token);
  return ok({ success: true });
});
