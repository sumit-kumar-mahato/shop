import "server-only";
import { prisma } from "@/lib/db";
import type { LinkSuggestion } from "@/components/admin/fields";

const PAGES: LinkSuggestion[] = [
  { label: "Home", href: "/" },
  { label: "Shop — all products", href: "/shop" },
  { label: "Shop — newest first", href: "/shop?sort=newest" },
  { label: "Shop — best sellers", href: "/shop?sort=popular" },
  { label: "Sale", href: "/shop?sale=1" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Kids", href: "/shop?gender=kids" },
  { label: "Offers", href: "/offers" },
  { label: "Journal / blog", href: "/blog" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Track your order", href: "/account/orders" },
  { label: "Shipping policy", href: "/policies/shipping" },
  { label: "Returns & refunds", href: "/policies/returns" },
  { label: "Privacy policy", href: "/policies/privacy" },
  { label: "Terms of service", href: "/policies/terms" },
];

/** Store pages and categories offered as suggestions in the admin link fields. */
export async function getLinkSuggestions(): Promise<{ links: LinkSuggestion[]; categories: Array<{ name: string; slug: string; image: string | null }> }> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, slug: true, image: true },
  });
  return { links: [...PAGES, ...categories.map((c) => ({ label: `Category — ${c.name}`, href: `/shop?category=${c.slug}` }))], categories };
}

/** Pages offered in the live-preview page picker. */
export async function getPreviewPaths() {
  const product = await prisma.product.findFirst({ where: { status: "ACTIVE" }, orderBy: { salesCount: "desc" }, select: { slug: true, title: true } });
  return [
    { label: "Homepage", href: "/" },
    { label: "Shop", href: "/shop" },
    ...(product ? [{ label: `Product — ${product.title}`, href: `/product/${product.slug}` }] : []),
    { label: "About", href: "/about" },
  ];
}
