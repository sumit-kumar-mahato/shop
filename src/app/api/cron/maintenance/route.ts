import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expireStalePendingOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

// Daily housekeeping, triggered by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" when the CRON_SECRET env variable is set.
// Regular database activity also stops free-tier databases (e.g. Supabase) from pausing.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  await expireStalePendingOrders();
  const [sessions, tokens, limits] = await Promise.all([
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.authToken.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
  ]);

  return NextResponse.json({
    ok: true,
    at: now.toISOString(),
    removed: { sessions: sessions.count, tokens: tokens.count, rateLimits: limits.count },
  });
}
