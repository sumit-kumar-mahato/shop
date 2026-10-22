import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";

export const PATCH = route(async (req, { params }) => {
  await requireStaff();
  const { isRead } = await parseJson(req, z.object({ isRead: z.boolean() }));
  await prisma.contactMessage.update({ where: { id: params.id }, data: { isRead } });
  return ok({ success: true });
});

export const DELETE = route(async (_req, { params }) => {
  await requireStaff();
  await prisma.contactMessage.delete({ where: { id: params.id } });
  return ok({ success: true });
});
