"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

/** Horizontally scrolling product row with snap points, arrows and a progress line. */
export default function ProductRail({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  products: ProductCardData[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!products.length) return null;
  const scrollable = !(edges.start && edges.end);

  return (
    <section className="container-page">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{eyebrow}</p>}
          <h2 className="mt-2 font-serif text-3xl sm:text-5xl">{title}</h2>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {href && (
            <Link href={href} className="group mr-2 hidden items-center gap-1 text-sm font-semibold sm:flex">
              View all <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          {scrollable && (
            <>
              <RailButton onClick={() => scrollBy(-1)} disabled={edges.start} label="Previous products">
                <ArrowLeft size={18} />
              </RailButton>
              <RailButton onClick={() => scrollBy(1)} disabled={edges.end} label="Next products">
                <ArrowRight size={18} />
              </RailButton>
            </>
          )}
        </div>
      </div>

      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:gap-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {products.map((p, i) => (
          <div key={p.id} className="w-[68%] flex-shrink-0 snap-start sm:w-[40%] md:w-[30%] lg:w-[calc(25%-18px)]">
            <ProductCard product={p} priority={i < 4} />
          </div>
        ))}
      </div>

      {scrollable && (
        <div className="mt-6 h-px w-full bg-luxury-200 dark:bg-zinc-800">
          <div className="h-px bg-luxury-900 transition-[width] duration-300 dark:bg-white" style={{ width: `${Math.max(12, progress * 100)}%` }} />
        </div>
      )}
      {href && (
        <Link href={href} className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold sm:hidden">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </section>
  );
}

function RailButton({ onClick, disabled, label, children }: { onClick: () => void; disabled: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border border-luxury-300 transition-all hover:border-luxury-900 hover:bg-luxury-900 hover:text-white disabled:pointer-events-none disabled:opacity-30 dark:border-zinc-700 dark:hover:border-white dark:hover:bg-white dark:hover:text-zinc-900",
      )}
    >
      {children}
    </button>
  );
}
