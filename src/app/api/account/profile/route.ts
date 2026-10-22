import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, parseJson, requireUser, route } from "@/lib/api";
import { nameSchema, phoneSchema } from "@/lib/validators";

const schema = z.object({
  name: nameSchema,
  phone: z.union([z.literal(""), phoneSchema]).optional(),
});

export const PATCH = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, schema);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: input.name, phone: input.phone || null },
    select: { id: true, name: true, email: true, phone: true },
  });
  return ok({ user: updated });
});
