import { prisma } from "@/lib/db";
import { ok, route } from "@/lib/api";
import { cardInclude, toCard } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Fresh product-card data for a list of slugs (used by "Recently viewed"). */
export const GET = route(async (req) => {
  const slugs = (new URL(req.url).searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,80}$/.test(s))
    .slice(0, 12);
  if (!slugs.length) return ok({ products: [] });
  const products = await prisma.product.findMany({ where: { slug: { in: slugs }, status: "ACTIVE" }, include: cardInclude });
  const bySlug = new Map(products.map((p) => [p.slug, toCard(p)]));
  return ok({ products: slugs.map((s) => bySlug.get(s)).filter(Boolean) });
});
