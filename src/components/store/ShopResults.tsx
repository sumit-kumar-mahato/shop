"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Rows2 } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import { ProductGrid } from "./ProductCard";
import SortSelect from "./SortSelect";
import { cn } from "@/lib/utils";

const KEY = "pkm_grid";

/** Result toolbar (count, density toggle, sort) and the product grid. */
export default function ShopResults({ products, total, sort }: { products: ProductCardData[]; total: number; sort: string }) {
  const [dense, setDense] = useState(false);

  useEffect(() => {
    try {
      setDense(localStorage.getItem(KEY) === "dense");
    } catch {
      // ignore
    }
  }, []);

  const choose = (d: boolean) => {
    setDense(d);
    try {
      localStorage.setItem(KEY, d ? "dense" : "roomy");
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-luxury-600 dark:text-zinc-400">
          <span className="font-semibold text-luxury-900 dark:text-white">{total}</span> {total === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-luxury-200 p-1 dark:border-zinc-700 lg:flex" role="group" aria-label="Grid size">
            <DensityButton active={!dense} onClick={() => choose(false)} label="Larger photos">
              <Rows2 size={16} />
            </DensityButton>
            <DensityButton active={dense} onClick={() => choose(true)} label="More per row">
              <LayoutGrid size={16} />
            </DensityButton>
          </div>
          <SortSelect value={sort} />
        </div>
      </div>
      <ProductGrid products={products} className={cn(dense ? "lg:grid-cols-4" : "lg:grid-cols-3")} />
    </>
  );
}

function DensityButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn("rounded-full p-2 transition-colors", active ? "bg-luxury-900 text-white dark:bg-white dark:text-zinc-900" : "text-luxury-500 hover:text-luxury-900 dark:hover:text-white")}
    >
      {children}
    </button>
  );
}
