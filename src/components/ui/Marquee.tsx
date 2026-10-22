import React from "react";
import { cn } from "@/lib/utils";

/** Endlessly scrolling row. Children are rendered twice for a seamless loop; pauses on hover. */
export default function Marquee({ children, duration = 40, className }: { children: React.ReactNode; duration?: number; className?: string }) {
  return (
    <div className={cn("group flex overflow-hidden", className)}>
      <div className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]" style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
