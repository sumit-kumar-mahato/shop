import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireStaff, route } from "@/lib/api";
import { revokeUserSessions } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

const schema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),
});

export const PATCH = route(async (req, { params }) => {
  const input = await parseJson(req, schema);
  const actor = await requireStaff({ adminOnly: true });
  if (params.id === actor.id) throw new ApiError(400, "You can't change your own role or disable your own account.");

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) throw new ApiError(404, "Customer not found.");

  if (target.role === "ADMIN" && (input.role && input.role !== "ADMIN" || input.isActive === false)) {
    const admins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (admins <= 1) throw new ApiError(400, "There must always be at least one active administrator.");
  }

  const user = await prisma.user.update({
    where: { id: target.id },
    data: { ...(input.isActive !== undefined ? { isActive: input.isActive } : {}), ...(input.role ? { role: input.role } : {}) },
    select: { id: true, role: true, isActive: true },
  });
  // Changing role or disabling an account signs the user out everywhere.
  if (input.isActive === false || (input.role && input.role !== target.role)) await revokeUserSessions(target.id);

  await audit(actor.id, "user.update", "User", target.id, { email: target.email, ...input });
  return ok({ user });
});
