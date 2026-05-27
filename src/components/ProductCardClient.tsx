"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import confetti from "canvas-confetti";

interface Product {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  categoryName: string;
  images: string; // JSON string
  colors: string; // JSON string
  sizes: string; // JSON string
  stock: number;
  rating?: number;
}

interface ProductCardClientProps {
  product: Product;
}

// Safe parse JSON
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default function ProductCardClient({ product }: ProductCardClientProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productImages = safeParse(product.images);
  const sizes = safeParse(product.sizes);
  const colors = safeParse(product.colors);
  const isLiked = isInWishlist(product.id);

  // Discount percentage helper
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: productImages[0] || "",
      size: sizes[0] || "M",
      color: colors[0] || "Gold",
      quantity: 1,
      stock: product.stock,
    });

    // Dispatch custom event to slide open Cart Drawer
    window.dispatchEvent(new CustomEvent("open-cart-drawer"));

    // Trigger visual confetti feedback
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.8 },
      colors: ["#c5a880", "#000000", "#ffffff"],
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: productImages[0] || "",
      categoryName: product.categoryName,
      stock: product.stock,
    });

    if (!isLiked) {
      window.dispatchEvent(new CustomEvent("open-wishlist-drawer"));
    }
  };

  return (
    <div className="group relative flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md card-shine">
      {/* Product Image and Overlay Controls */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
        <Image
          src={productImages[0] || "/placeholder.jpg"}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        {discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-luxury-gold text-zinc-950 text-[9px] font-bold px-2 py-0.5 uppercase rounded-sm z-10">
            -{discountPercentage}%
          </span>
        )}

        {product.stock === 0 ? (
          <span className="absolute top-2 right-2 bg-zinc-800 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase rounded-sm z-10">
            Sold Out
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase rounded-sm animate-pulse z-10">
            Low Stock ({product.stock})
          </span>
        ) : null}

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="bg-white hover:bg-luxury-gold text-zinc-950 hover:text-zinc-950 w-10 h-10 rounded-full flex items-center justify-center shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title={product.stock === 0 ? "Out of Stock" : "Quick Add to Bag"}
          >
            <ShoppingBag size={16} />
          </button>
          <button
            onClick={handleWishlist}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white hover:bg-red-50 text-zinc-950 hover:text-red-500"
            }`}
            title="Add to Wishlist"
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Navigation Link covering whole image */}
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* Info Details */}
      <div className="flex flex-col space-y-1 flex-grow text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-widest text-luxury-500 font-bold uppercase">{product.categoryName}</span>
          {product.rating && (
            <div className="flex items-center text-[10px] text-amber-500 font-bold">
              <Star size={10} fill="currentColor" className="mr-0.5" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>
        <Link href={`/product/${product.id}`} className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1 uppercase tracking-wide">
          {product.title}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-luxury-900 dark:text-white font-mono">₹{product.price}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-luxury-400 dark:text-zinc-500 line-through font-mono">₹{product.compareAtPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
