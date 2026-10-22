"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useToast } from "@/components/ui/Toast";
import { discountPercent, formatINR } from "@/lib/money";
import type { ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const { add, openDrawer } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.totalStock <= 0;
  const liked = wishlist.has(product.id);

  const quickAdd = async () => {
    if (!product.quickAddVariantId) return;
    setAdding(true);
    const res = await add(product.quickAddVariantId, 1);
    setAdding(false);
    if (res.ok) openDrawer();
    else toast(res.message ?? "Could not add to bag", "error");
  };

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-luxury-100 dark:bg-zinc-900">
        <Link href={`/product/${product.slug}`} aria-label={product.title} className="absolute inset-0">
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.title}
                loading={priority ? "eager" : "lazy"}
                className={cn("h-full w-full object-cover transition-all duration-700 group-hover:scale-105", product.hoverImage && "group-hover:opacity-0", soldOut && "opacity-70")}
              />
              {product.hoverImage && (
                <img src={product.hoverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-luxury-400">No image</div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1">
          {soldOut ? (
            <span className="rounded-sm bg-luxury-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Sold out</span>
          ) : off > 0 ? (
            <span className="rounded-sm bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-fg">−{off}%</span>
          ) : null}
          {product.isNewArrival && !soldOut && <span className="rounded-sm bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-luxury-900">New</span>}
          {!soldOut && product.totalStock <= 3 && (
            <span className="rounded-sm bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">Only {product.totalStock} left</span>
          )}
        </div>

        <button
          onClick={() => wishlist.toggle(product.id)}
          className={cn(
            "absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition-colors hover:bg-white dark:bg-zinc-900/90",
            liked ? "text-red-500" : "text-luxury-700 dark:text-zinc-300",
          )}
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={liked}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        {!soldOut && (
          <div className="absolute inset-x-2 bottom-2 translate-y-2 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
            {product.quickAddVariantId ? (
              <button onClick={quickAdd} disabled={adding} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-sm bg-white/95 text-sm font-semibold text-luxury-900 shadow hover:bg-white disabled:opacity-60">
                <Plus size={16} /> {adding ? "Adding…" : "Quick add"}
              </button>
            ) : (
              <Link href={`/product/${product.slug}`} className="flex h-10 w-full items-center justify-center rounded-sm bg-white/95 text-sm font-semibold text-luxury-900 shadow hover:bg-white">
                Choose size
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        {product.categoryName && <p className="text-[11px] uppercase tracking-wider text-luxury-500">{product.categoryName}</p>}
        <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-medium text-luxury-900 hover:text-brand dark:text-zinc-100">
          {product.title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{formatINR(product.price)}</span>
          {off > 0 && product.compareAtPrice && <span className="text-xs text-luxury-400 line-through">{formatINR(product.compareAtPrice)}</span>}
          {product.ratingCount > 0 && (
            <span className="ml-auto text-xs text-luxury-500">
              ★ {product.ratingAvg.toFixed(1)} <span className="text-luxury-400">({product.ratingCount})</span>
            </span>
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="flex gap-1 pt-0.5" aria-label={`${product.colors.length} colours`}>
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-luxury-300 dark:border-zinc-600" style={{ backgroundColor: c.hex ?? "#ccc" }} />
            ))}
            {product.colors.length > 5 && <span className="text-[10px] text-luxury-500">+{product.colors.length - 5}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductGrid({ products, className }: { products: ProductCardData[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
