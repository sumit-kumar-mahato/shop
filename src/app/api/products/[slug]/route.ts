import { prisma } from "@/lib/db";
import { ApiError, ok, route } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { sortSizes } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Public product details for the Quick view panel. */
export const GET = route<{ params: { slug: string } }>(async (_req, { params }) => {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, status: "ACTIVE" },
    include: { category: { select: { name: true } }, variants: { where: { isActive: true }, orderBy: { position: "asc" } } },
  });
  if (!product) throw new ApiError(404, "Product not found.");
  const store = await getSettings("store");

  const variants = product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, price: v.price ?? product.price }));
  return ok({
    product: {
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      categoryName: product.category?.name ?? null,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      description: product.description,
      fabric: product.fabric,
      fit: product.fit,
      careInstructions: product.careInstructions,
    },
    images: product.images,
    variants,
    sizeOrder: sortSizes([...new Set(variants.map((v) => v.size))]),
    delivery: {
      estimate: store.shipping.estimatedDelivery,
      freeAbove: store.shipping.freeShippingThreshold,
      returnDays: store.orders.returnWindowDays,
      cod: store.payments.codEnabled,
      taxIncluded: store.tax.pricesIncludeTax,
    },
  });
});
