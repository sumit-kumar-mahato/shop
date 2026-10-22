"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Image with a shimmer while loading, a soft fade-in, and a tidy placeholder if the file is missing
 * (e.g. a deleted external link), instead of the browser's broken-image icon.
 */
export default function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  eager,
  sizes,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setState(src ? "loading" : "error");
    // Cached images can finish loading before React attaches onLoad.
    const img = imgRef.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "loaded" : "error");
  }, [src]);

  return (
    <div className={cn("overflow-hidden bg-luxury-100 dark:bg-zinc-900", !className?.includes("absolute") && "relative", className)}>
      {state === "loading" && <div className="shimmer absolute inset-0 animate-shimmer" aria-hidden />}
      {state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-luxury-400 dark:text-zinc-600" role="img" aria-label={alt}>
          <ImageOff size={28} strokeWidth={1.25} />
          <span className="text-[11px] uppercase tracking-widest">Image coming soon</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src ?? undefined}
          alt={alt}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("error")}
          className={cn("h-full w-full object-cover transition-opacity duration-700", state === "loaded" ? "opacity-100" : "opacity-0", imgClassName)}
        />
      )}
    </div>
  );
}
