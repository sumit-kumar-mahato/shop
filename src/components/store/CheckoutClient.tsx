"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Check, CreditCard, Lock, MapPin, Pencil, Plus, ShoppingBag } from "lucide-react";
import { useCart, clearStoredCoupon } from "@/components/providers/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { Button, LinkButton } from "@/components/ui/Button";
import { FormError, Textarea } from "@/components/ui/Form";
import { EmptyState, Spinner } from "@/components/ui/Misc";
import { api, errorMessage } from "@/lib/fetcher";
import { formatINR } from "@/lib/money";
import { openRazorpay } from "@/lib/razorpay-client";
import { cn } from "@/lib/utils";
import AddressForm, { type AddressData } from "./AddressForm";
import CouponForm from "./CouponForm";
import OrderSummary from "./OrderSummary";

type Props = {
  initialAddresses: AddressData[];
  user: { name: string; email: string; phone: string | null; emailVerified: boolean };
  payments: { cod: boolean; codMax: number; online: boolean };
  requireVerification: boolean;
  storeName: string;
  brandColor: string;
  taxRate: number;
};

type PlaceResponse = {
  orderNumber: string;
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
  prefill: { name: string; email: string; contact: string };
};

export default function CheckoutClient({ initialAddresses, user, payments, requireVerification, storeName, brandColor, taxRate }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { quote, couponCode, refresh } = useCart();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState<string | null>(initialAddresses.find((a) => a.isDefault)?.id ?? initialAddresses[0]?.id ?? null);
  const [editing, setEditing] = useState<AddressData | "new" | null>(initialAddresses.length === 0 ? "new" : null);
  const total = quote?.totals.total ?? 0;
  const codAllowed = payments.cod && (payments.codMax === 0 || total <= payments.codMax);
  const [method, setMethod] = useState<"COD" | "RAZORPAY" | null>(null);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (method === "COD" && !codAllowed) setMethod(payments.online ? "RAZORPAY" : null);
    if (method === null) setMethod(payments.online ? "RAZORPAY" : codAllowed ? "COD" : null);
  }, [method, codAllowed, payments.online]);

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
        <EmptyState icon={<ShoppingBag size={44} />} title="Your bag is empty" description="Add something to your bag before checking out." action={<LinkButton href="/shop">Shop now</LinkButton>} />
      </div>
    );
  }

  const blockedByVerification = requireVerification && !user.emailVerified;

  const placeOrder = async () => {
    setError(null);
    if (!addressId) return setError("Please add a delivery address.");
    if (!method) return setError("Please choose a payment method.");
    setPlacing(true);
    try {
      const res = await api<PlaceResponse>("/api/checkout", { body: { addressId, paymentMethod: method, couponCode, note: note || null } });
      if (res.razorpay) {
        let payment;
        try {
          payment = await openRazorpay({
            keyId: res.razorpay.keyId,
            orderId: res.razorpay.orderId,
            amount: res.razorpay.amount,
            currency: res.razorpay.currency,
            storeName,
            description: `Order ${res.orderNumber}`,
            prefill: res.prefill,
            color: brandColor,
          });
        } catch (err) {
          toast(errorMessage(err), "error");
          router.push(`/account/orders/${res.orderNumber}?payment=failed`);
          return;
        }
        if (!payment) {
          toast("Payment was not completed. You can retry from your order page.", "info");
          router.push(`/account/orders/${res.orderNumber}?payment=pending`);
          return;
        }
        await api("/api/payments/razorpay/verify", { body: { orderNumber: res.orderNumber, ...payment } });
      }
      clearStoredCoupon();
      await refresh();
      router.push(`/account/orders/${res.orderNumber}?placed=1`);
    } catch (err) {
      setError(errorMessage(err));
      await refresh();
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl sm:text-4xl">Checkout</h1>
        <p className="flex items-center gap-1.5 text-sm text-luxury-500">
          <Lock size={14} /> Secure checkout
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <Step n={1} title="Delivery address">
            {editing ? (
              <AddressForm
                initial={editing === "new" ? null : editing}
                defaultName={user.name}
                defaultPhone={user.phone}
                onCancel={addresses.length ? () => setEditing(null) : undefined}
                onSaved={(a) => {
                  setAddresses((prev) => {
                    const others = prev.filter((p) => p.id !== a.id).map((p) => (a.isDefault ? { ...p, isDefault: false } : p));
                    return [a, ...others];
                  });
                  setAddressId(a.id);
                  setEditing(null);
                }}
              />
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-sm border p-4 transition-colors",
                      addressId === a.id ? "border-luxury-900 bg-luxury-50 dark:border-zinc-300 dark:bg-zinc-900" : "border-luxury-200 hover:border-luxury-400 dark:border-zinc-800",
                    )}
                  >
                    <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 accent-[rgb(var(--brand-rgb))]" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">
                        {a.fullName} <span className="font-normal text-luxury-500">· {a.phone}</span>
                        {a.isDefault && <span className="ml-2 rounded-sm bg-luxury-100 px-1.5 py-0.5 text-[11px] font-medium dark:bg-zinc-800">Default</span>}
                      </p>
                      <p className="mt-1 text-luxury-600 dark:text-zinc-400">
                        {[a.line1, a.line2, a.landmark, a.city, a.state].filter(Boolean).join(", ")} – {a.postalCode}
                      </p>
                    </div>
                    <button type="button" onClick={() => setEditing(a)} className="self-start p-1 text-luxury-500 hover:text-luxury-900" aria-label="Edit address">
                      <Pencil size={16} />
                    </button>
                  </label>
                ))}
                <button type="button" onClick={() => setEditing("new")} className="flex items-center gap-2 text-sm font-semibold hover:text-brand">
                  <Plus size={16} /> Add a new address
                </button>
              </div>
            )}
          </Step>

          <Step n={2} title="Payment method">
            <div className="space-y-3">
              {payments.online && (
                <PayOption
                  checked={method === "RAZORPAY"}
                  onSelect={() => setMethod("RAZORPAY")}
                  icon={<CreditCard size={20} />}
                  title="Pay online"
                  description="UPI, debit/credit card, net banking or wallet — processed securely by Razorpay."
                />
              )}
              {payments.cod && (
                <PayOption
                  checked={method === "COD"}
                  onSelect={() => codAllowed && setMethod("COD")}
                  disabled={!codAllowed}
                  icon={<Banknote size={20} />}
                  title="Cash on Delivery"
                  description={codAllowed ? "Pay in cash or UPI when your order arrives." : `Not available for orders above ${formatINR(payments.codMax)}.`}
                />
              )}
              {!payments.online && !payments.cod && <p className="text-sm text-red-600">Checkout is temporarily unavailable. Please contact the store.</p>}
            </div>
          </Step>

          <Step n={3} title="Order note (optional)">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder="Anything we should know? e.g. gift wrap, delivery instructions" />
          </Step>
        </div>

        <aside className="h-fit space-y-5 rounded-sm border border-luxury-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl">Your order</h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {quote.lines.map((l) => (
              <li key={l.variantId} className="flex gap-3 text-sm">
                <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden bg-luxury-100 dark:bg-zinc-800">
                  {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-luxury-900 text-[10px] font-bold text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{l.title}</p>
                  <p className="text-xs text-luxury-500">{l.size} · {l.color}</p>
                  {l.issue && <p className="text-xs font-medium text-red-600">Needs attention in your bag</p>}
                </div>
                <p className="font-medium">{formatINR(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <CouponForm />
          <OrderSummary totals={quote.totals} couponCode={quote.coupon?.applied ? quote.coupon.code : null} taxRate={taxRate} />
          <FormError message={error} />
          {blockedByVerification && (
            <p className="rounded-sm bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Please verify your email before ordering. <Link href="/account" className="font-semibold underline">Resend link</Link>
            </p>
          )}
          {quote.hasIssues ? (
            <LinkButton href="/cart" variant="outline" fullWidth>Review your bag</LinkButton>
          ) : (
            <Button size="lg" fullWidth onClick={placeOrder} loading={placing} disabled={!addressId || !method || !!editing || blockedByVerification}>
              {method === "RAZORPAY" ? `Pay ${formatINR(quote.totals.total)}` : `Place order · ${formatINR(quote.totals.total)}`}
            </Button>
          )}
          <p className="text-center text-xs text-luxury-500">
            By placing your order you agree to our <Link href="/policies/terms" className="underline">terms</Link> and{" "}
            <Link href="/policies/returns" className="underline">return policy</Link>.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-luxury-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-serif text-xl">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-luxury-900 font-sans text-xs font-bold text-white dark:bg-white dark:text-zinc-900">{n}</span>
        {title}
        {n === 1 && <MapPin size={16} className="text-luxury-400" />}
      </h2>
      {children}
    </section>
  );
}

function PayOption({ checked, onSelect, icon, title, description, disabled }: { checked: boolean; onSelect: () => void; icon: React.ReactNode; title: string; description: string; disabled?: boolean }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-sm border p-4 transition-colors",
        checked ? "border-luxury-900 bg-luxury-50 dark:border-zinc-300 dark:bg-zinc-950" : "border-luxury-200 hover:border-luxury-400 dark:border-zinc-800",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input type="radio" name="payment" checked={checked} onChange={onSelect} disabled={disabled} className="mt-1 accent-[rgb(var(--brand-rgb))]" />
      <span className="mt-0.5 text-brand">{icon}</span>
      <span className="flex-1 text-sm">
        <span className="font-semibold">{title}</span>
        <span className="mt-0.5 block text-luxury-600 dark:text-zinc-400">{description}</span>
      </span>
      {checked && <Check size={18} className="text-green-600" />}
    </label>
  );
}
