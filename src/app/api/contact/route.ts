import { z } from "zod";
import { prisma } from "@/lib/db";
import { limitByIp, ok, parseJson, route } from "@/lib/api";
import { emailSchema, nameSchema } from "@/lib/validators";
import { getSettings } from "@/lib/settings";
import { escapeHtml, sendMail } from "@/lib/mail";

const schema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10, "Please write a little more").max(3000),
  website: z.string().max(0).optional(), // honeypot — must stay empty
});

export const POST = route(async (req) => {
  await limitByIp(req, "contact", 5, 3600);
  const input = await parseJson(req, schema);
  await prisma.contactMessage.create({
    data: { name: input.name, email: input.email, phone: input.phone || null, subject: input.subject, message: input.message },
  });
  const store = await getSettings("store");
  const to = store.orders.notifyEmail || store.contactEmail;
  if (to) {
    await sendMail(
      to,
      `New message: ${input.subject}`,
      `<p><strong>${escapeHtml(input.name)}</strong> (${escapeHtml(input.email)}${input.phone ? `, ${escapeHtml(input.phone)}` : ""}) wrote:</p><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`,
    );
  }
  return ok({ success: true }, { status: 201 });
});
