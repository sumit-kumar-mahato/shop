"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "./SessionProvider";
import { api, errorMessage } from "@/lib/fetcher";
import type { CartQuote } from "@/lib/types";

type Line = { variantId: string; quantity: number };

const CART_KEY = "pkm_cart_v2";
const COUPON_KEY = "pkm_coupon";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode) — cart still works for this page view
  }
}

/** Guest cart lines, sent along on sign-in so they're merged into the account cart. */
export function readGuestCart(): Line[] {
  const lines = readStorage<Line[]>(CART_KEY, []);
  return Array.isArray(lines) ? lines.filter((l) => typeof l?.variantId === "string" && Number.isInteger(l?.quantity)).slice(0, 50) : [];
}

export function clearGuestCart() {
  writeStorage(CART_KEY, null);
}

type CartContextValue = {
  quote: CartQuote | null;
  loading: boolean;
  count: number;
  couponCode: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (variantId: string, quantity: number) => Promise<{ ok: boolean; message?: string }>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  remove: (variantId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message?: string }>;
  removeCoupon: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const user = useSession()?.id ?? null;
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [guestLines, setGuestLines] = useState<Line[]>([]);
  const requestId = useRef(0);

  const fetchQuote = useCallback(
    async (lines: Line[] | null, coupon: string | null) => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        const q = user
          ? await api<CartQuote>(`/api/cart${coupon ? `?coupon=${encodeURIComponent(coupon)}` : ""}`)
          : await api<CartQuote>("/api/cart/quote", { body: { lines: lines ?? [], coupon } });
        if (id !== requestId.current) return q;
        setQuote(q);
        if (!user) {
          // Keep browser storage in sync with what's actually purchasable.
          const synced = q.lines.map((l) => ({ variantId: l.variantId, quantity: l.issue === "QUANTITY_REDUCED" ? l.maxQuantity : l.quantity }));
          setGuestLines(synced);
          writeStorage(CART_KEY, synced);
        }
        return q;
      } catch (err) {
        console.error("cart quote failed", err);
        return null;
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [user],
  );

  // Initial load.
  useEffect(() => {
    const coupon = readStorage<string | null>(COUPON_KEY, null);
    setCouponCode(coupon);
    if (user) {
      clearGuestCart();
      void fetchQuote(null, coupon);
    } else {
      const lines = readGuestCart();
      setGuestLines(lines);
      void fetchQuote(lines, coupon);
    }
  }, [user, fetchQuote]);

  const add = useCallback<CartContextValue["add"]>(
    async (variantId, quantity) => {
      try {
        if (user) {
          setLoading(true);
          const q = await api<CartQuote>(`/api/cart${couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : ""}`, {
            method: "POST",
            body: { variantId, quantity },
          });
          setQuote(q);
          setLoading(false);
        } else {
          const existing = guestLines.find((l) => l.variantId === variantId);
          const next = existing
            ? guestLines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(l.quantity + quantity, 10) } : l))
            : [...guestLines, { variantId, quantity: Math.min(quantity, 10) }];
          setGuestLines(next);
          writeStorage(CART_KEY, next);
          await fetchQuote(next, couponCode);
        }
        return { ok: true };
      } catch (err) {
        setLoading(false);
        return { ok: false, message: errorMessage(err) };
      }
    },
    [user, guestLines, couponCode, fetchQuote],
  );

  const setQuantity = useCallback<CartContextValue["setQuantity"]>(
    async (variantId, quantity) => {
      if (user) {
        setLoading(true);
        try {
          const q = await api<CartQuote>(`/api/cart${couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : ""}`, {
            method: "PUT",
            body: { variantId, quantity },
          });
          setQuote(q);
        } finally {
          setLoading(false);
        }
      } else {
        const next = quantity <= 0 ? guestLines.filter((l) => l.variantId !== variantId) : guestLines.map((l) => (l.variantId === variantId ? { ...l, quantity } : l));
        setGuestLines(next);
        writeStorage(CART_KEY, next);
        await fetchQuote(next, couponCode);
      }
    },
    [user, guestLines, couponCode, fetchQuote],
  );

  const remove = useCallback((variantId: string) => setQuantity(variantId, 0), [setQuantity]);

  const applyCoupon = useCallback<CartContextValue["applyCoupon"]>(
    async (code) => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return { ok: false, message: "Enter a coupon code." };
      const q = await fetchQuote(user ? null : guestLines, normalized);
      if (q?.coupon?.applied) {
        setCouponCode(normalized);
        writeStorage(COUPON_KEY, normalized);
        return { ok: true };
      }
      // Keep the previous (valid) coupon applied.
      await fetchQuote(user ? null : guestLines, couponCode);
      return { ok: false, message: q?.coupon?.message ?? "This coupon cannot be applied." };
    },
    [user, guestLines, couponCode, fetchQuote],
  );

  const removeCoupon = useCallback(async () => {
    setCouponCode(null);
    writeStorage(COUPON_KEY, null);
    await fetchQuote(user ? null : guestLines, null);
  }, [user, guestLines, fetchQuote]);

  const refresh = useCallback(async () => {
    await fetchQuote(user ? null : guestLines, couponCode);
  }, [user, guestLines, couponCode, fetchQuote]);

  const count = useMemo(() => {
    if (quote) return quote.lines.reduce((n, l) => n + l.quantity, 0);
    return guestLines.reduce((n, l) => n + l.quantity, 0);
  }, [quote, guestLines]);

  const value: CartContextValue = {
    quote,
    loading,
    count,
    couponCode,
    drawerOpen,
    openDrawer: useCallback(() => setDrawerOpen(true), []),
    closeDrawer: useCallback(() => setDrawerOpen(false), []),
    add,
    setQuantity,
    remove,
    applyCoupon,
    removeCoupon,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function clearStoredCoupon() {
  writeStorage(COUPON_KEY, null);
}
