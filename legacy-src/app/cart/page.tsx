"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { Trash2, ShoppingBag, ArrowRight, Tag, X, ShieldAlert } from "lucide-react";

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    gst,
    discount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingFee,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [validating, setValidating] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidating(true);
    setCouponError("");
    const success = await applyCoupon(couponCode);
    setValidating(false);

    if (success) {
      setCouponCode("");
    } else {
      setCouponError("Invalid, inactive, or expired coupon code.");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-luxury-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-luxury-500">
          <ShoppingBag size={28} />
        </div>
        <h1 className="serif-header text-3xl uppercase tracking-wide">Your bag is empty</h1>
        <p className="text-sm text-luxury-500 font-light max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added anything to your wardrobe yet. Explore our luxury collection to find your fits.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-block bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 text-xs font-bold tracking-widest px-8 py-4 rounded-sm transition-all uppercase"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="serif-header text-3xl uppercase tracking-wide mb-10 text-center lg:text-left border-b border-luxury-200/40 dark:border-zinc-800/40 pb-4">
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 rounded-sm shadow-sm"
            >
              {/* Product Thumbnail */}
              <div className="relative w-20 aspect-[3/4] overflow-hidden bg-luxury-100 dark:bg-zinc-950 flex-shrink-0 border border-luxury-200/30">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>

              {/* Product Details */}
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-sm line-clamp-1">
                    <Link href={`/product/${item.productId}`} className="hover:text-luxury-gold transition-colors">
                      {item.title}
                    </Link>
                  </h3>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:text-red-500 text-luxury-400 transition-colors"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-[11px] text-luxury-500 font-light mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  <span>Size: <span className="font-semibold text-zinc-900 dark:text-white uppercase">{item.size}</span></span>
                  <span>Color: <span className="font-semibold text-zinc-900 dark:text-white uppercase" style={{ color: item.color }}>{item.color}</span></span>
                </p>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-luxury-200 dark:border-zinc-800 h-8">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 text-xs hover:text-luxury-gold transition-colors font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-semibold font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 text-xs hover:text-luxury-gold transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Price info */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-luxury-900 dark:text-white">₹{item.price * item.quantity}</span>
                    {item.quantity > 1 && (
                      <p className="text-[10px] text-luxury-400 font-light mt-0.5">₹{item.price} each</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6 bg-luxury-100/50 dark:bg-zinc-900 p-6 border border-luxury-200/50 dark:border-zinc-800 rounded-sm">
          <h2 className="text-sm font-bold tracking-widest uppercase pb-4 border-b border-luxury-200 dark:border-zinc-800">
            Order Summary
          </h2>

          <div className="space-y-3.5 text-xs font-light">
            <div className="flex justify-between">
              <span className="text-luxury-500">Subtotal</span>
              <span className="font-semibold">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-luxury-500">GST (12% Apparel Tax)</span>
              <span className="font-semibold">₹{gst}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Discount Applied</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between pb-3.5 border-b border-luxury-200 dark:border-zinc-800">
              <span className="text-luxury-500">Shipping Fee</span>
              <span>
                {shippingFee > 0 ? (
                  `₹${shippingFee}`
                ) : (
                  <span className="text-green-600 font-bold uppercase text-[10px]">Free Delivery</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-end text-sm font-bold pt-1">
              <span>Final Total</span>
              <span className="text-lg text-luxury-900 dark:text-white">₹{finalTotal}</span>
            </div>
          </div>

          {/* Coupon Code section */}
          <div className="pt-4 border-t border-luxury-200 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold tracking-widest text-luxury-500 uppercase flex items-center gap-1.5">
              <Tag size={13} /> Promo Code
            </span>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 text-green-600 text-xs font-semibold px-3 py-2 border border-green-200 dark:border-green-800/40 rounded-sm animate-scale-in">
                <span className="flex items-center gap-1">
                  Code: <span className="font-bold">{appliedCoupon.code}</span> (
                  {appliedCoupon.type === "PERCENTAGE" ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`})
                </span>
                <button onClick={removeCoupon} className="hover:text-red-500 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FASHION20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white flex-grow uppercase font-semibold"
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="bg-luxury-900 dark:bg-zinc-800 text-white font-bold text-xs tracking-widest px-4 py-2.5 rounded-sm hover:bg-luxury-gold hover:text-zinc-950 transition-all uppercase"
                >
                  {validating ? "..." : "APPLY"}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[11px] text-red-500 flex items-center gap-1 animate-slide-down">
                <ShieldAlert size={12} /> {couponError}
              </p>
            )}
          </div>

          {/* Checkout Button */}
          <div className="pt-4">
            <Link
              href="/checkout"
              className="w-full bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 h-13 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 rounded-sm active:scale-95 transition-colors border border-luxury-900"
            >
              PROCEED TO SECURE CHECKOUT <ArrowRight size={14} />
            </Link>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-luxury-400 font-light">
              Free delivery applies to all orders above ₹2000 in India.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
