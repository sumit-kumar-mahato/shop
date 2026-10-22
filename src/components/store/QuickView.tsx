"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { api, errorMessage } from "@/lib/fetcher";
import SmartImage from "@/components/ui/SmartImage";
import { Spinner } from "@/components/ui/Misc";
import ProductPurchase from "./ProductPurchase";
import { cn } from "@/lib/utils";

type QuickData = Omit<React.ComponentProps<typeof ProductPurchase>, "compact" | "onAdded"> & { images: string[] };

/** Side panel to choose a size/colour and add to bag without leaving the current page. */
export default function QuickView({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const [data, setData] = useState<QuickData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setData(null);
    setError(null);
    setActive(0);
    const controller = new AbortController();
    api<QuickData>(`/api/products/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then(setData)
      .catch((e) => setError(errorMessage(e)));
    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [slug, onClose]);

  if (!slug) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Quick view">
      <div className="absolute inset-0 animate-fade-in bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-4xl animate-slide-in-right flex-col overflow-hidden bg-white shadow-2xl dark:bg-zinc-950">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-zinc-900" aria-label="Close quick view">
          <X size={20} />
        </button>
        {!data ? (
          <div className="flex flex-1 items-center justify-center">{error ? <p className="text-sm text-red-600">{error}</p> : <Spinner />}</div>
        ) : (
          <div className="grid flex-1 overflow-y-auto md:grid-cols-2">
            <div className="bg-luxury-100 dark:bg-zinc-900 md:sticky md:top-0 md:h-full">
              <SmartImage src={data.images[active]} alt={data.product.title} className="aspect-[3/4] w-full md:h-[calc(100%-88px)] md:aspect-auto" eager />
              {data.images.length > 1 && (
                <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                  {data.images.map((img, i) => (
                    <button
                      key={img + i}
                      onClick={() => setActive(i)}
                      className={cn("h-16 w-12 flex-shrink-0 overflow-hidden border-2", i === active ? "border-luxury-900 dark:border-white" : "border-transparent opacity-60 hover:opacity-100")}
                      aria-label={`Image ${i + 1}`}
                    >
                      <SmartImage src={img} alt="" className="h-full w-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 sm:p-10">
              <ProductPurchase {...data} compact onAdded={onClose} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
