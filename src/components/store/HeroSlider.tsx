"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

export default function HeroSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((i: number) => setCurrent(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % count), 6500);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section
      className="relative h-[72vh] min-h-[460px] w-full overflow-hidden bg-zinc-950 sm:h-[82vh]"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={cn("absolute inset-0 transition-opacity duration-1000", i === current ? "z-10 opacity-100" : "z-0 opacity-0")}
          aria-hidden={i !== current}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          <img src={b.image} alt="" className={cn("absolute inset-0 h-full w-full object-cover", i === current && "animate-kenburns")} loading={i === 0 ? "eager" : "lazy"} />
          <div className={cn("absolute inset-0", b.align === "center" ? "bg-black/45" : "bg-gradient-to-r from-black/75 via-black/40 to-transparent")} />
          <div className={cn("container-page relative flex h-full flex-col justify-center", b.align === "center" && "items-center text-center")}>
            <div className={cn("max-w-xl space-y-5 text-white", i === current && "animate-fade-in-up")}>
              {b.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{b.eyebrow}</p>}
              <h1 className="font-serif text-4xl leading-tight sm:text-6xl">{b.title}</h1>
              {b.description && <p className="text-base leading-relaxed text-zinc-200 sm:text-lg">{b.description}</p>}
              {b.buttonText && b.link && (
                <Link href={b.link} tabIndex={i === current ? 0 : -1} className="inline-flex h-12 items-center rounded-sm bg-white px-8 text-sm font-semibold text-zinc-950 transition-colors hover:bg-brand hover:text-brand-fg">
                  {b.buttonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {count > 1 && (
        <>
          <button onClick={() => go(current - 1)} className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur hover:bg-white/30 sm:block" aria-label="Previous slide">
            <ChevronLeft size={22} />
          </button>
          <button onClick={() => go(current + 1)} className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur hover:bg-white/30 sm:block" aria-label="Next slide">
            <ChevronRight size={22} />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button key={b.id} onClick={() => go(i)} className={cn("h-1.5 rounded-full transition-all", i === current ? "w-8 bg-white" : "w-3 bg-white/50")} aria-label={`Go to slide ${i + 1}`} aria-current={i === current} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
