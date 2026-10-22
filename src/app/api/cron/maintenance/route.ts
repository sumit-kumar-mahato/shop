import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { expireStalePendingOrders } from "@/lib/orders";
import { submitToIndexNow } from "@/lib/indexnow";

export const dynamic = "force-dynamic";

// Daily housekeeping, triggered by Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" when the CRON_SECRET env variable is set.
// Regular database activity also stops free-tier databases (e.g. Supabase) from pausing.
// Pages changed in the admin since the last run are reported to search engines (IndexNow).
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

  const since = new Date(now.getTime() - 26 * 3_600_000); // daily run + margin
  const [products, categories, posts, settings] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE", updatedAt: { gte: since } }, select: { slug: true } }),
    prisma.category.findMany({ where: { isActive: true, updatedAt: { gte: since } }, select: { slug: true } }),
    prisma.blogPost.findMany({ where: { isPublished: true, updatedAt: { gte: since } }, select: { slug: true } }),
    prisma.setting.count({ where: { key: { not: { startsWith: "draft:" } }, updatedAt: { gte: since } } }),
  ]);
  const changed = [
    ...(settings > 0 || products.length > 0 ? ["/", "/shop"] : []),
    ...products.map((p) => `/product/${p.slug}`),
    ...categories.map((c) => `/shop?category=${c.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  const indexNow = await submitToIndexNow(changed);

  return NextResponse.json({
    ok: true,
    at: now.toISOString(),
    removed: { sessions: sessions.count, tokens: tokens.count, rateLimits: limits.count },
    searchEngines: indexNow,
  });
}
