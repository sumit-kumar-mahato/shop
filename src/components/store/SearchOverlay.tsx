"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/fetcher";
import { formatINR } from "@/lib/money";
import type { ProductCardData } from "@/lib/types";

type Results = { products: ProductCardData[]; categories: Array<{ name: string; slug: string }> };

export default function SearchOverlay({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      api<Results>(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then(setResults)
        .catch(() => undefined)
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  if (!open) return null;

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative animate-slide-down bg-white shadow-2xl dark:bg-zinc-900">
        <form onSubmit={submit} className="container-page flex items-center gap-3 py-5">
          <Search className="flex-shrink-0 text-luxury-400" size={22} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shirts, sarees, jeans, linen…"
            className="h-12 w-full bg-transparent text-lg text-luxury-900 placeholder:text-luxury-400 focus:outline-none dark:text-white"
            maxLength={80}
            aria-label="Search"
          />
          {loading && <Loader2 className="animate-spin text-brand" size={20} />}
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800" aria-label="Close search">
            <X size={20} />
          </button>
        </form>

        {results && (
          <div className="container-page max-h-[70vh] overflow-y-auto border-t border-luxury-100 pb-6 pt-4 dark:border-zinc-800">
            {results.categories.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {results.categories.map((c) => (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={onClose} className="rounded-full border border-luxury-200 px-3 py-1 text-sm hover:border-brand dark:border-zinc-700">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
            {results.products.length === 0 ? (
              <p className="py-6 text-center text-sm text-luxury-500">No products match “{query}”.</p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {results.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.slug}`} onClick={onClose} className="flex items-center gap-4 rounded-sm p-2 hover:bg-luxury-50 dark:hover:bg-zinc-800">
                      <div className="h-16 w-12 flex-shrink-0 overflow-hidden bg-luxury-100 dark:bg-zinc-800">
                        {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.title}</p>
                        <p className="text-xs text-luxury-500">{p.categoryName}</p>
                        <p className="text-sm font-semibold">{formatINR(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={submit} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-luxury-900 hover:text-brand dark:text-white">
              See all results for “{query}” <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
