import { ok, route } from "@/lib/api";
import { buildShopWhere, cardInclude, toCard } from "@/lib/catalog";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return ok({ products: [], categories: [] });

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: buildShopWhere({ q }),
      include: cardInclude,
      orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.category.findMany({
      where: { isActive: true, name: { contains: q, mode: "insensitive" } },
      select: { name: true, slug: true },
      take: 4,
    }),
  ]);
  return ok({ products: products.map(toCard), categories });
});
