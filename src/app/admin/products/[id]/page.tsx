import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

const rupees = (paise: number | null | undefined) => (paise == null ? "" : String(paise / 100));

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id }, include: { variants: { orderBy: { position: "asc" } } } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  const initial: ProductFormValues = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    categoryId: product.categoryId ?? "",
    gender: product.gender,
    price: rupees(product.price),
    compareAtPrice: rupees(product.compareAtPrice),
    images: product.images,
    fabric: product.fabric ?? "",
    fit: product.fit ?? "",
    careInstructions: product.careInstructions ?? "",
    tags: product.tags.join(", "),
    status: product.status,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    isTrending: product.isTrending,
    isFlashSale: product.isFlashSale,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    variants: product.variants.map((v) => ({
      key: v.id,
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex ?? "",
      stock: String(v.stock),
      price: rupees(v.price),
      isActive: v.isActive,
    })),
  };

  return (
    <div>
      <PageHeader title={product.title} description={`${product.salesCount} sold · rating ${product.ratingAvg.toFixed(1)} (${product.ratingCount})`} back={{ href: "/admin/products", label: "Products" }} />
      <ProductForm key={product.updatedAt.toISOString()} initial={initial} categories={categories} />
    </div>
  );
}
