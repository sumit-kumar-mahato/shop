"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const src = images[active];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:max-h-[640px] sm:flex-col sm:overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={cn("aspect-[3/4] w-16 flex-shrink-0 overflow-hidden border-2 bg-luxury-100 sm:w-20", i === active ? "border-luxury-900 dark:border-white" : "border-transparent opacity-70 hover:opacity-100")}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div
        className="relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden bg-luxury-100 dark:bg-zinc-900"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {src ? (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200"
            style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-luxury-400">No image</div>
        )}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white sm:hidden">
            {active + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
