"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

/**
 * Desktop: editorial grid of all photos. Phones: swipeable carousel with dots.
 * Any photo opens a full-screen viewer with arrows, keyboard and swipe support.
 */
export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [""];

  return (
    <>
      {/* Phones & tablets */}
      <div className="relative lg:hidden">
        <div
          ref={track}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {list.map((img, i) => (
            <button key={img + i} onClick={() => img && setLightbox(i)} className="w-full flex-shrink-0 snap-center" aria-label={`Open image ${i + 1}`}>
              <SmartImage src={img} alt={i === 0 ? title : ""} eager={i === 0} className="aspect-[3/4] w-full" />
            </button>
          ))}
        </div>
        {list.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full bg-white shadow transition-all", i === mobileIndex ? "w-6" : "w-1.5 opacity-60")} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className={cn("hidden content-start items-start gap-3 lg:grid", list.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
        {list.map((img, i) => (
          <button
            key={img + i}
            onClick={() => img && setLightbox(i)}
            className={cn("group relative cursor-zoom-in overflow-hidden", i === 0 && list.length > 2 && "col-span-2")}
            aria-label={`Open image ${i + 1} full screen`}
          >
            <SmartImage
              src={img}
              alt={i === 0 ? title : ""}
              eager={i < 2}
              className={cn("w-full", i === 0 && list.length > 2 ? "aspect-[4/5]" : "aspect-[3/4]")}
              imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
            <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-luxury-900 opacity-0 shadow transition-opacity group-hover:opacity-100">
              <Expand size={16} />
            </span>
          </button>
        ))}
      </div>

      {lightbox !== null && <Lightbox images={images} start={lightbox} title={title} onClose={() => setLightbox(null)} />}
    </>
  );
}

function Lightbox({ images, start, title, onClose }: { images: string[]; start: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [touchX, setTouchX] = useState<number | null>(null);
  const go = useCallback((n: number) => setI(((n % images.length) + images.length) % images.length), [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [i, go, onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex animate-fade-in items-center justify-center bg-zinc-950/95"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image ${i + 1} of ${images.length}`}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        setTouchX(null);
      }}
    >
      <img key={i} src={images[i]} alt={title} className="max-h-[92vh] max-w-[92vw] animate-scale-in object-contain" />
      <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close">
        <X size={22} />
      </button>
      {images.length > 1 && (
        <>
          <button onClick={() => go(i - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Previous image">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => go(i + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Next image">
            <ChevronRight size={24} />
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-white/70">
            {i + 1} / {images.length}
          </p>
        </>
      )}
    </div>
  );
}
