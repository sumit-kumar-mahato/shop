"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;

export default function HeroSlider({ banners, fullScreen }: { banners: Banner[]; fullScreen?: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count]);

  // Auto-advance; hovering pauses both the timer and the progress bar, resuming where they stopped.
  const remaining = useRef(SLIDE_MS);
  const startedAt = useRef(0);
  useEffect(() => {
    remaining.current = SLIDE_MS;
  }, [current]);
  useEffect(() => {
    if (count <= 1) return;
    if (paused) return;
    startedAt.current = Date.now();
    const t = setTimeout(() => setCurrent((c) => (c + 1) % count), remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [count, paused, current]);

  // Swipe on touch screens.
  const [touchX, setTouchX] = useState<number | null>(null);

  if (count === 0) return null;
  const b = banners[current];

  return (
    <section
      className={cn("relative w-full overflow-hidden bg-zinc-950 text-white", fullScreen ? "h-[100svh] min-h-[620px]" : "h-[78vh] min-h-[520px]")}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
        setTouchX(null);
      }}
    >
      {banners.map((slide, i) => (
        <div
          key={slide.id}
          className={cn("absolute inset-0 transition-opacity duration-[1400ms] ease-out", i === current ? "z-10 opacity-100" : "z-0 opacity-0")}
          aria-hidden={i !== current}
        >
          <img
            src={slide.image}
            alt=""
            className={cn("absolute inset-0 h-full w-full object-cover", i === current && "animate-kenburns")}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
          <div className={cn("absolute inset-0", slide.align === "center" ? "bg-black/45" : "bg-gradient-to-r from-black/80 via-black/40 to-black/5")} />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ))}

      {/* Text — keyed by slide so the entrance animation replays on every change */}
      <div className={cn("container-page relative z-20 flex h-full flex-col justify-center", fullScreen && "pt-20", b.align === "center" && "items-center text-center")}>
        <div key={b.id} className="max-w-2xl">
          {b.eyebrow && (
            <div className="overflow-hidden">
              <p className="animate-rise text-xs font-semibold uppercase tracking-[0.35em] text-brand" style={{ animationDelay: "100ms" }}>
                {b.eyebrow}
              </p>
            </div>
          )}
          <div className="mt-4 overflow-hidden pb-2">
            <h1 className="animate-rise font-serif text-5xl leading-[1.02] sm:text-7xl lg:text-8xl" style={{ animationDelay: "200ms" }}>
              {b.title}
            </h1>
          </div>
          {b.description && (
            <div className="overflow-hidden">
              <p className="mt-4 max-w-xl animate-rise text-base leading-relaxed text-white/80 sm:text-lg" style={{ animationDelay: "350ms" }}>
                {b.description}
              </p>
            </div>
          )}
          {b.buttonText && b.link && (
            <div className={cn("mt-9 flex animate-fade-in-up flex-wrap gap-3", b.align === "center" && "justify-center")} style={{ animationDelay: "500ms" }}>
              <Link href={b.link} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-zinc-950 transition-all hover:bg-brand hover:text-brand-fg">
                {b.buttonText}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/shop" className="inline-flex h-12 items-center rounded-full border border-white/40 px-8 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10">
                Explore all
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="container-page absolute inset-x-0 bottom-8 z-20 flex items-end justify-between gap-6">
        {count > 1 ? (
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs tabular-nums text-white/70">
              {String(current + 1).padStart(2, "0")} <span className="text-white/40">/ {String(count).padStart(2, "0")}</span>
            </span>
            <div className="flex gap-2">
              {banners.map((s, i) => (
                <button key={s.id} onClick={() => go(i)} className="group py-3" aria-label={`Go to slide ${i + 1}`} aria-current={i === current}>
                  <span className="block h-[2px] w-10 overflow-hidden bg-white/25 sm:w-16">
                    {i === current && (
                      <span
                        key={current}
                        className={cn("block h-full origin-left animate-progress-fill bg-white", paused && "[animation-play-state:paused]")}
                        style={{ "--progress-duration": `${SLIDE_MS}ms` } as React.CSSProperties}
                      />
                    )}
                    {i < current && <span className="block h-full bg-white/60" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <span />
        )}

        {fullScreen && (
          <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-white/60 md:flex">
            Scroll
            <span className="relative h-8 w-[1px] overflow-hidden bg-white/20">
              <span className="absolute left-0 top-0 h-3 w-full animate-scroll-cue bg-white" />
            </span>
          </div>
        )}

        {count > 1 && (
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => go(current - 1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-950" aria-label="Previous slide">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(current + 1)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 backdrop-blur-sm transition-colors hover:bg-white hover:text-zinc-950" aria-label="Next slide">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
