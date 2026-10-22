"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Heart, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useToast } from "@/components/ui/Toast";
import SmartImage from "@/components/ui/SmartImage";
import Reveal from "@/components/ui/Reveal";
import { discountPercent, formatINR } from "@/lib/money";
import type { ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import QuickView from "./QuickView";

export default function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const { add, openDrawer } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const [pop, setPop] = useState(false);
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.totalStock <= 0;
  const liked = wishlist.has(product.id);

  const quickAdd = async () => {
    if (!product.quickAddVariantId) return setQuickView(true);
    setAdding(true);
    const res = await add(product.quickAddVariantId, 1);
    setAdding(false);
    if (res.ok) openDrawer();
    else toast(res.message ?? "Could not add to bag", "error");
  };

  const toggleWishlist = () => {
    if (!liked) {
      setPop(true);
      setTimeout(() => setPop(false), 450);
    }
    void wishlist.toggle(product.id);
  };

  return (
    <div className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-luxury-100 dark:bg-zinc-900">
        <Link href={`/product/${product.slug}`} aria-label={product.title} className="absolute inset-0">
          <SmartImage
            src={product.image}
            alt={product.title}
            eager={priority}
            className="absolute inset-0"
            imgClassName={cn("transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]", soldOut && "grayscale-[40%]")}
          />
          {product.hoverImage && (
            <SmartImage
              src={product.hoverImage}
              alt=""
              className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              imgClassName="scale-[1.06] transition-transform duration-[1.2s] ease-out group-hover:scale-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <Badge className="bg-luxury-900/90 text-white">Sold out</Badge>
          ) : off > 0 ? (
            <Badge className="bg-brand text-brand-fg">−{off}%</Badge>
          ) : null}
          {product.isNewArrival && !soldOut && <Badge className="bg-white/90 text-luxury-900 backdrop-blur">New</Badge>}
          {!soldOut && product.totalStock <= 3 && <Badge className="bg-red-600 text-white">Only {product.totalStock} left</Badge>}
        </div>

        <button
          onClick={toggleWishlist}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:scale-110 dark:bg-zinc-900/90",
            liked ? "text-red-500" : "text-luxury-700 dark:text-zinc-300",
            pop && "animate-pop",
          )}
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={liked}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 flex translate-y-3 gap-2 opacity-0 transition-all duration-500 ease-out group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
            <button
              onClick={quickAdd}
              disabled={adding}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/95 text-xs font-semibold uppercase tracking-wider text-luxury-900 shadow-lg backdrop-blur transition-colors hover:bg-luxury-900 hover:text-white disabled:opacity-60 max-lg:hidden"
            >
              <Plus size={15} /> {adding ? "Adding…" : product.quickAddVariantId ? "Quick add" : "Choose size"}
            </button>
            <button
              onClick={() => setQuickView(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-luxury-900 shadow-lg backdrop-blur transition-colors hover:bg-luxury-900 hover:text-white max-lg:ml-auto max-lg:h-9 max-lg:w-9"
              aria-label={`Quick view ${product.title}`}
            >
              <Eye size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="line-clamp-1 text-sm font-medium text-luxury-900 transition-colors hover:text-brand dark:text-zinc-100">
            {product.title}
          </Link>
          {product.ratingCount > 0 && (
            <span className="flex-shrink-0 text-xs text-luxury-500">★ {product.ratingAvg.toFixed(1)}</span>
          )}
        </div>
        {product.categoryName && <p className="text-[11px] uppercase tracking-[0.15em] text-luxury-500">{product.categoryName}</p>}
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">{formatINR(product.price)}</span>
            {off > 0 && product.compareAtPrice && <span className="text-xs text-luxury-400 line-through">{formatINR(product.compareAtPrice)}</span>}
          </p>
          {product.colors.length > 1 && (
            <span className="flex items-center gap-1" aria-label={`${product.colors.length} colours`}>
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.name} title={c.name} className="h-3 w-3 rounded-full ring-1 ring-black/10 dark:ring-white/20" style={{ backgroundColor: c.hex ?? "#ccc" }} />
              ))}
              {product.colors.length > 4 && <span className="text-[10px] text-luxury-500">+{product.colors.length - 4}</span>}
            </span>
          )}
        </div>
      </div>

      <QuickView slug={quickView ? product.slug : null} onClose={() => setQuickView(false)} />
    </div>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", className)}>{children}</span>;
}

export function ProductGrid({ products, className }: { products: ProductCardData[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:gap-x-6", !className?.includes("lg:grid-cols-") && "lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 80}>
          <ProductCard product={p} priority={i < 4} />
        </Reveal>
      ))}
    </div>
  );
}
