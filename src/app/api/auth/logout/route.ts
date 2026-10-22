import { ok, route } from "@/lib/api";
import { destroyCurrentSession } from "@/lib/auth/session";

export const POST = route(async () => {
  await destroyCurrentSession();
  return ok({ success: true });
});
