import { ok, requireUser, route } from "@/lib/api";
import { revokeUserSessions } from "@/lib/auth/session";

/** Sign out of all other devices. */
export const DELETE = route(async () => {
  const user = await requireUser();
  await revokeUserSessions(user.id, user.sessionId);
  return ok({ success: true });
});
