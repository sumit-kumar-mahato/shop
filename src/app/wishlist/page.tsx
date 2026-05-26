"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    addToCart({
      productId: item.productId,
      title: item.title,
      price: item.price,
      image: item.image,
      size: "M", // Default fallback size
      color: "#000000", // Default color
      quantity: 1,
      stock: item.stock,
    });

    // Remove from wishlist
    toggleWishlist(item);

    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.8 },
      colors: ["#c5a880", "#000000"],
    });
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-luxury-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-luxury-500">
          <Heart size={28} />
        </div>
        <h1 className="serif-header text-3xl uppercase tracking-wide">Your wishlist is empty</h1>
        <p className="text-xs text-luxury-500 font-light max-w-sm mx-auto leading-relaxed">
          Keep track of your favorite apparel by adding them here. Browse our collections and save pieces you love.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 text-xs font-bold tracking-widest px-8 py-3.5 rounded-sm transition-all uppercase"
        >
          BROWSE COLLECTIONS
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="serif-header text-3xl uppercase tracking-wide mb-10 text-center lg:text-left border-b border-luxury-200/40 dark:border-zinc-800/40 pb-4">
        Saved Wishlist
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.productId}
            className="group flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md relative"
          >
            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-zinc-800 rounded-full text-red-500 shadow hover:scale-115 transition-transform"
                title="Remove from Wishlist"
              >
                <Trash2 size={14} />
              </button>
              <Link href={`/product/${item.productId}`} className="absolute inset-0 z-0" />
            </div>

            {/* Description details */}
            <div className="flex flex-col space-y-1 flex-grow">
              <span className="text-[9px] tracking-widest text-luxury-500 font-bold uppercase">
                {item.categoryName}
              </span>
              <Link
                href={`/product/${item.productId}`}
                className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1"
              >
                {item.title}
              </Link>
              <p className="text-sm font-bold text-luxury-900 dark:text-white mt-1">₹{item.price}</p>
            </div>

            {/* Move to Bag button */}
            <button
              onClick={() => handleMoveToCart(item)}
              className="w-full bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 text-[10px] font-bold tracking-widest py-2.5 uppercase rounded-sm transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingBag size={12} /> ADD TO BAG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
