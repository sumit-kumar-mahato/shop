"use client";

import { ArrowRight, Lock, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Misc";
import { formatINR } from "@/lib/money";
import CartLineItem from "./CartLineItem";
import CouponForm from "./CouponForm";
import OrderSummary from "./OrderSummary";

export default function CartPageClient() {
  const { quote, loading } = useCart();

  if (!quote) {
    return (
      <div className="container-page flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (quote.lines.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShoppingBag size={44} />}
          title="Your bag is empty"
          description="Looks like you haven't added anything yet. Explore our collections to find something you love."
          action={<LinkButton href="/shop">Start shopping</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-serif text-3xl sm:text-4xl">Shopping bag</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          {quote.amountToFreeShipping > 0 && (
            <p className="mb-4 flex items-center gap-2 rounded-sm bg-luxury-100 px-4 py-3 text-sm dark:bg-zinc-900">
              <Truck size={16} className="text-brand" /> Add {formatINR(quote.amountToFreeShipping)} more to get free shipping.
            </p>
          )}
          <ul className={`divide-y divide-luxury-200 border-y border-luxury-200 dark:divide-zinc-800 dark:border-zinc-800 ${loading ? "opacity-70" : ""}`}>
            {quote.lines.map((line) => (
              <CartLineItem key={line.variantId} line={line} />
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-5 rounded-sm border border-luxury-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl">Order summary</h2>
          <CouponForm />
          <OrderSummary totals={quote.totals} couponCode={quote.coupon?.applied ? quote.coupon.code : null} />
          {quote.hasIssues && (
            <p className="rounded-sm bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Please remove or update the highlighted items before checking out.
            </p>
          )}
          <LinkButton href="/checkout" size="lg" fullWidth aria-disabled={quote.hasIssues} className={quote.hasIssues ? "pointer-events-none opacity-50" : ""}>
            Checkout securely <ArrowRight size={16} />
          </LinkButton>
          <p className="flex items-center justify-center gap-1.5 text-xs text-luxury-500">
            <Lock size={12} /> Secure checkout · UPI, cards & COD
          </p>
        </aside>
      </div>
    </div>
  );
}
