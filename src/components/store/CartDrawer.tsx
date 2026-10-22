"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/money";
import { LinkButton } from "@/components/ui/Button";
import CartLineItem from "./CartLineItem";

export default function CartDrawer({ estimatedDelivery }: { codEnabled: boolean; estimatedDelivery: string }) {
  const { quote, drawerOpen, closeDrawer, count, loading } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;
  const lines = quote?.lines ?? [];
  const threshold = quote?.freeShippingThreshold ?? 0;
  const remaining = quote?.amountToFreeShipping ?? 0;
  const progress = threshold > 0 ? Math.min(100, ((threshold - remaining) / threshold) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={closeDrawer} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col bg-white shadow-2xl dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-luxury-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="flex items-center gap-2 font-serif text-xl">
            <ShoppingBag size={20} className="text-brand" /> Your bag {count > 0 && <span className="text-sm text-luxury-500">({count})</span>}
          </h2>
          <button onClick={closeDrawer} className="rounded-full p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800" aria-label="Close bag">
            <X size={20} />
          </button>
        </div>

        {lines.length > 0 && threshold > 0 && (
          <div className="border-b border-luxury-100 bg-luxury-50 px-5 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <p className="flex items-center gap-2">
              <Truck size={16} className="text-brand" />
              {remaining > 0 ? (
                <span>
                  Add <strong>{formatINR(remaining)}</strong> more for free shipping
                </span>
              ) : (
                <span className="font-medium text-green-700 dark:text-green-400">You&apos;ve unlocked free shipping!</span>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-luxury-200 dark:bg-zinc-800">
              <div className="h-full bg-brand transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag size={44} className="text-luxury-300 dark:text-zinc-700" />
              <p className="mt-4 font-serif text-xl">{loading ? "Loading your bag…" : "Your bag is empty"}</p>
              {!loading && (
                <>
                  <p className="mt-1 text-sm text-luxury-500">Discover something you&apos;ll love.</p>
                  <LinkButton href="/shop" onClick={closeDrawer} className="mt-6">
                    Start shopping
                  </LinkButton>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-luxury-100 dark:divide-zinc-800">
              {lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} compact onNavigate={closeDrawer} />
              ))}
            </ul>
          )}
        </div>

        {quote && lines.length > 0 && (
          <div className="space-y-3 border-t border-luxury-200 px-5 py-4 dark:border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-luxury-600 dark:text-zinc-400">Subtotal</span>
              <span className="font-semibold">{formatINR(quote.totals.subtotal)}</span>
            </div>
            {quote.totals.discount > 0 && (
              <div className="flex justify-between text-sm text-green-700 dark:text-green-400">
                <span>Discount ({quote.coupon?.code})</span>
                <span>−{formatINR(quote.totals.discount)}</span>
              </div>
            )}
            <p className="text-xs text-luxury-500">Shipping & taxes calculated at checkout · Delivery in {estimatedDelivery}</p>
            {quote.hasIssues && <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Some items need your attention before checkout.</p>}
            <div className="grid grid-cols-2 gap-2">
              <LinkButton href="/cart" variant="outline" onClick={closeDrawer}>
                View bag
              </LinkButton>
              <LinkButton href="/checkout" onClick={closeDrawer} aria-disabled={quote.hasIssues}>
                Checkout <ArrowRight size={16} />
              </LinkButton>
            </div>
            <Link href="/shop" onClick={closeDrawer} className="block text-center text-xs text-luxury-500 underline-offset-2 hover:underline">
              Continue shopping
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
