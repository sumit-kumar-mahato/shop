import { prisma } from "@/lib/db";
import { ok, requireStaff, route } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Quick search for the admin command palette (orders, products, customers). */
export const GET = route(async (req) => {
  await requireStaff();
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return ok({ orders: [], products: [], customers: [] });

  const [orders, products, customers] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { shippingName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, orderNumber: true, shippingName: true, total: true, status: true },
    }),
    prisma.product.findMany({
      where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }] },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, images: true, status: true },
    }),
    prisma.user.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true },
    }),
  ]);

  return ok({
    orders,
    products: products.map((p) => ({ id: p.id, title: p.title, image: p.images[0] ?? null, status: p.status })),
    customers,
  });
});
