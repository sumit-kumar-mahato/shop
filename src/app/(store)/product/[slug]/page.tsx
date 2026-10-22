import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Gender } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { getProductCards, sortSizes } from "@/lib/catalog";
import ProductRail from "@/components/store/ProductRail";
import RecentlyViewed from "@/components/store/RecentlyViewed";
import ProductGallery from "@/components/store/ProductGallery";
import ProductPurchase from "@/components/store/ProductPurchase";
import ProductReviews from "@/components/store/ProductReviews";

type Props = { params: { slug: string } };

async function loadProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { where: { isActive: true }, orderBy: { position: "asc" } },
    },
  });
}

/** Same-category products first, topped up with others for the same audience. */
async function relatedProducts(productId: string, categoryId: string | null, gender: Gender) {
  const sameCategory = categoryId ? await getProductCards({ id: { not: productId }, categoryId }, { take: 8 }) : [];
  if (sameCategory.length >= 8) return sameCategory;
  const more = await getProductCards(
    { id: { notIn: [productId, ...sameCategory.map((p) => p.id)] }, gender: { in: [gender, "UNISEX"] } },
    { take: 8 - sameCategory.length, orderBy: [{ salesCount: "desc" }] },
  );
  return [...sameCategory, ...more];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await loadProduct(params.slug);
  if (!product || product.status !== "ACTIVE") return { title: "Product not found" };
  const description = product.seoDescription || product.description.slice(0, 160);
  return {
    title: product.seoTitle || product.title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  let product = await loadProduct(params.slug);
  if (!product) {
    // Support old /product/<id> links from the previous version of the site.
    const byId = await prisma.product.findUnique({ where: { id: params.slug }, select: { slug: true } });
    if (byId) permanentRedirect(`/product/${byId.slug}`);
    notFound();
  }
  const user = await getCurrentUser();
  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";
  if (product.status !== "ACTIVE" && !isStaff) notFound();

  const [store, page, reviews, myReview, related] = await Promise.all([
    getSettings("store"),
    getSettings("productPage"),
    prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true } } },
    }),
    user ? prisma.review.findUnique({ where: { productId_userId: { productId: product.id, userId: user.id } }, select: { status: true } }) : null,
    relatedProducts(product.id, product.categoryId, product.gender),
  ]);

  const variants = product.variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    colorHex: v.colorHex,
    stock: v.stock,
    price: v.price ?? product!.price,
  }));
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: store.storeName },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(product.ratingCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.ratingAvg, reviewCount: product.ratingCount } } : {}),
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {product.status !== "ACTIVE" && (
        <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Preview: this product is <strong>{product.status.toLowerCase()}</strong> and is not visible to customers.
        </div>
      )}

      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-luxury-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:underline">Shop</Link>
        {product.category && (
          <>
            <ChevronRight size={12} />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:underline">{product.category.name}</Link>
          </>
        )}
        <ChevronRight size={12} />
        <span className="line-clamp-1 text-luxury-800 dark:text-zinc-300">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div className="self-start">
          <ProductGallery images={product.images} title={product.title} />
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductPurchase
          product={{
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
          }}
          variants={variants}
          sizeOrder={sortSizes([...new Set(variants.map((v) => v.size))])}
          delivery={{
            estimate: store.shipping.estimatedDelivery,
            freeAbove: store.shipping.freeShippingThreshold,
            returnDays: store.orders.returnWindowDays,
            cod: store.payments.codEnabled,
            taxIncluded: store.tax.pricesIncludeTax,
          }}
          page={page}
        />
        </div>
      </div>

      {page.showReviews && (
        <ProductReviews
          productId={product.id}
          ratingAvg={product.ratingAvg}
          ratingCount={product.ratingCount}
          distribution={distribution}
          reviews={reviews.map((r) => ({
            id: r.id,
            rating: r.rating,
            title: r.title,
            comment: r.comment,
            author: r.user.name.split(" ")[0],
            verified: r.isVerifiedPurchase,
            createdAt: r.createdAt.toISOString(),
          }))}
          signedIn={Boolean(user)}
          myReviewStatus={myReview?.status ?? null}
        />
      )}

      {page.showCompleteTheLook && related.length > 0 && (
        <div className="-mx-4 mt-24 border-t border-luxury-200 pt-20 dark:border-zinc-800 sm:-mx-6 lg:-mx-8">
          <ProductRail eyebrow="You may also like" title={page.completeTheLookTitle || "Complete the Look"} products={related} href={product.category ? `/shop?category=${product.category.slug}` : "/shop"} />
        </div>
      )}
      {page.showRecentlyViewed && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <RecentlyViewed currentSlug={product.slug} />
        </div>
      )}
    </div>
  );
}
