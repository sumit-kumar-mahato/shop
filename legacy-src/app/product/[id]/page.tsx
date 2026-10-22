import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

// Helper to safely parse JSON strings
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;

  // 1. Fetch Product
  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
    });
  } catch (e) {}

  if (!product) {
    return notFound();
  }

  // 2. Fetch approved reviews
  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: {
        productId: id,
        approved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (e) {}

  // 3. Fetch Related Products
  let relatedProducts: any[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryName: product.categoryName,
        NOT: {
          id: product.id,
        },
      },
      take: 4,
    });
  } catch (e) {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-luxury-500 font-medium">
        <Link href="/" className="hover:text-luxury-gold transition-colors">HOME</Link>
        <ChevronRight size={12} />
        <Link href="/shop" className="hover:text-luxury-gold transition-colors">SHOP</Link>
        <ChevronRight size={12} />
        <Link href={`/shop?category=${product.categoryName.toLowerCase()}`} className="hover:text-luxury-gold transition-colors uppercase">{product.categoryName}</Link>
        <ChevronRight size={12} />
        <span className="text-luxury-900 dark:text-zinc-400 font-bold truncate max-w-[150px] uppercase">{product.title}</span>
      </nav>

      {/* Main product showcase section */}
      <ProductDetailClient product={product} reviews={reviews} />

      {/* Related Products Showcase */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-luxury-200 dark:border-zinc-800 pt-16 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">Capsule Recommendations</span>
            <h2 className="serif-header text-2xl sm:text-3xl font-normal uppercase tracking-wide">You May Also Like</h2>
            <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const imgs = safeParse(p.images);
              return (
                <div key={p.id} className="group relative flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
                    <Image
                      src={imgs[0] || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <Link href={`/product/${p.id}`} className="absolute inset-0 z-10" />
                  </div>
                  <div className="flex flex-col space-y-1 flex-grow">
                    <div className="flex justify-between items-center text-[10px] text-luxury-500 font-bold uppercase">
                      <span>{p.categoryName}</span>
                      <div className="flex items-center text-amber-500">
                        <Star size={10} fill="currentColor" className="mr-0.5" />
                        <span>{p.rating}</span>
                      </div>
                    </div>
                    <Link href={`/product/${p.id}`} className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1">
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-luxury-900 dark:text-white">₹{p.price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
