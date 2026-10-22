import { z } from "zod";
import { prisma } from "@/lib/db";
import { limitByIp, ok, parseJson, route } from "@/lib/api";
import { emailSchema } from "@/lib/validators";

export const POST = route(async (req) => {
  await limitByIp(req, "newsletter", 10, 3600);
  const { email } = await parseJson(req, z.object({ email: emailSchema }));
  await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: { isActive: true } });
  return ok({ success: true });
});
