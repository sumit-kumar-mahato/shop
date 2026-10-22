import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { GENDER_FROM_PARAM, PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductCardData } from "@/lib/types";

export const cardInclude = {
  category: { select: { name: true } },
  variants: { where: { isActive: true }, select: { id: true, stock: true, color: true, colorHex: true }, orderBy: { position: "asc" } },
} satisfies Prisma.ProductInclude;

type CardProduct = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: CardProduct): ProductCardData {
  const totalStock = p.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
  const inStock = p.variants.filter((v) => v.stock > 0);
  const colors = new Map<string, string | null>();
  for (const v of p.variants) if (!colors.has(v.color)) colors.set(v.color, v.colorHex);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0] ?? null,
    hoverImage: p.images[1] ?? null,
    categoryName: p.category?.name ?? null,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    totalStock,
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    quickAddVariantId: p.variants.length === 1 && inStock.length === 1 ? inStock[0].id : null,
    isNewArrival: p.isNewArrival,
  };
}

export async function getProductCards(where: Prisma.ProductWhereInput, opts: { take?: number; orderBy?: Prisma.ProductOrderByWithRelationInput[] } = {}) {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", ...where },
    include: cardInclude,
    orderBy: opts.orderBy ?? [{ createdAt: "desc" }],
    take: opts.take ?? 8,
  });
  return products.map(toCard);
}

export type ShopParams = {
  q?: string;
  category?: string;
  gender?: string;
  size?: string;
  color?: string;
  min?: string;
  max?: string;
  sale?: string;
  instock?: string;
  sort?: string;
  page?: string;
};

export const SORT_OPTIONS = {
  featured: "Featured",
  newest: "Newest",
  popular: "Best selling",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
} as const;

function list(v?: string) {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function buildShopWhere(params: ShopParams): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: "ACTIVE" }];

  const q = params.q?.trim().slice(0, 80);
  if (q) {
    const words = q.split(/\s+/).filter(Boolean).slice(0, 5);
    for (const w of words) {
      and.push({
        OR: [
          { title: { contains: w, mode: "insensitive" } },
          { description: { contains: w, mode: "insensitive" } },
          { fabric: { contains: w, mode: "insensitive" } },
          { tags: { has: w.toLowerCase() } },
          { category: { name: { contains: w, mode: "insensitive" } } },
        ],
      });
    }
  }

  if (params.category) and.push({ category: { slug: params.category } });

  const genders = list(params.gender?.toLowerCase())
    .map((g) => GENDER_FROM_PARAM[g])
    .filter(Boolean);
  if (genders.length) {
    // Unisex items are shown in Men's and Women's listings too.
    const withUnisex = genders.some((g) => g === "MEN" || g === "WOMEN") ? [...genders, "UNISEX" as const] : genders;
    and.push({ gender: { in: withUnisex } });
  }

  const sizes = list(params.size);
  const colors = list(params.color);
  if (sizes.length || colors.length || params.instock === "1") {
    and.push({
      variants: {
        some: {
          isActive: true,
          ...(sizes.length ? { size: { in: sizes } } : {}),
          ...(colors.length ? { color: { in: colors } } : {}),
          ...(params.instock === "1" || sizes.length ? { stock: { gt: 0 } } : {}),
        },
      },
    });
  }

  const min = Number(params.min);
  const max = Number(params.max);
  if (Number.isFinite(min) && min > 0) and.push({ price: { gte: Math.round(min * 100) } });
  if (Number.isFinite(max) && max > 0) and.push({ price: { lte: Math.round(max * 100) } });

  if (params.sale === "1") and.push({ compareAtPrice: { not: null } });

  return { AND: and };
}

export function buildShopOrder(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "popular":
      return [{ salesCount: "desc" }, { createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
    default:
      return [{ isFeatured: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }];
  }
}

export async function searchShop(params: ShopParams) {
  const page = Math.max(1, Math.min(500, parseInt(params.page ?? "1", 10) || 1));
  const where = buildShopWhere(params);
  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy: buildShopOrder(params.sort),
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
  ]);
  return { products: products.map(toCard), total, page, pageCount: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)) };
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Free Size", "One Size"];

export function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });
}

/** Sizes and colors that currently exist on active products — used to build filter options. */
export async function getShopFacets() {
  const [sizes, colors, priceRange, categories] = await Promise.all([
    prisma.productVariant.findMany({ where: { isActive: true, product: { status: "ACTIVE" } }, distinct: ["size"], select: { size: true } }),
    prisma.productVariant.findMany({
      where: { isActive: true, product: { status: "ACTIVE" } },
      distinct: ["color"],
      select: { color: true, colorHex: true },
    }),
    prisma.product.aggregate({ where: { status: "ACTIVE" }, _max: { price: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true } }),
  ]);
  return {
    sizes: sortSizes(sizes.map((s) => s.size)),
    colors: colors.map((c) => ({ name: c.color, hex: c.colorHex })).sort((a, b) => a.name.localeCompare(b.name)),
    maxPrice: Math.ceil((priceRange._max.price ?? 0) / 100),
    categories,
  };
}

/** Recompute a product's average rating from approved reviews. */
export async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count._all },
  });
}
