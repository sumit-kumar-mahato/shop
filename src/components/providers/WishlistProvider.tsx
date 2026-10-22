"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "./SessionProvider";
import { api, errorMessage } from "@/lib/fetcher";
import { useToast } from "@/components/ui/Toast";

type WishlistContextValue = {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const user = useSession()?.id ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    api<{ productIds: string[] }>("/api/wishlist")
      .then((d) => setIds(new Set(d.productIds)))
      .catch(() => undefined);
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        toast("Sign in to save items to your wishlist.", "info");
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const had = ids.has(productId);
      setIds((prev) => {
        const next = new Set(prev);
        if (had) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (had) await api(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" });
        else await api("/api/wishlist", { body: { productId } });
        toast(had ? "Removed from wishlist" : "Saved to wishlist");
      } catch (err) {
        setIds((prev) => {
          const next = new Set(prev);
          if (had) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast(errorMessage(err), "error");
      }
    },
    [user, ids, router, pathname, toast],
  );

  return <WishlistContext.Provider value={{ ids, has: (id) => ids.has(id), toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
