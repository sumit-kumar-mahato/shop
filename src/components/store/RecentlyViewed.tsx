"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/fetcher";
import type { ProductCardData } from "@/lib/types";
import ProductRail from "./ProductRail";

const KEY = "pkm_recent";

/** Remembers products this visitor looked at (in their browser only) and shows them again. */
export default function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const [products, setProducts] = useState<ProductCardData[]>([]);

  useEffect(() => {
    let previous: string[] = [];
    try {
      previous = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (!Array.isArray(previous)) previous = [];
      localStorage.setItem(KEY, JSON.stringify([currentSlug, ...previous.filter((s) => s !== currentSlug)].slice(0, 12)));
    } catch {
      // storage unavailable
    }
    const others = previous.filter((s) => typeof s === "string" && s !== currentSlug).slice(0, 8);
    if (!others.length) return;
    api<{ products: ProductCardData[] }>(`/api/products/cards?slugs=${encodeURIComponent(others.join(","))}`)
      .then((d) => setProducts(d.products))
      .catch(() => undefined);
  }, [currentSlug]);

  if (!products.length) return null;
  return (
    <div className="mt-24">
      <ProductRail eyebrow="Pick up where you left off" title="Recently Viewed" products={products} />
    </div>
  );
}
