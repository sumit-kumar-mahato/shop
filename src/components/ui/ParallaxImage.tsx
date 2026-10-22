"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Background image that drifts slower than the page scroll for a sense of depth. */
export default function ParallaxImage({ src, className, strength = 0.18 }: { src: string; className?: string; strength?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = wrap.current;
      if (!el || !img.current) return;
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.current.style.transform = `translate3d(0, ${(-progress * strength * 100).toFixed(2)}%, 0) scale(1.25)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={wrap} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <img ref={img} src={src} alt="" loading="lazy" className="absolute inset-0 h-full w-full scale-125 object-cover will-change-transform" />
    </div>
  );
}
