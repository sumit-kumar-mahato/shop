"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress < 0.15) return null;
  const circumference = 2 * Math.PI * 20;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="no-print fixed bottom-5 right-5 z-30 flex h-12 w-12 animate-fade-in items-center justify-center rounded-full bg-white shadow-lg dark:bg-zinc-900"
      aria-label="Back to top"
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="20" fill="none" strokeWidth="2.5" className="stroke-luxury-200 dark:stroke-zinc-700" />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          stroke="rgb(var(--brand-rgb))"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <ArrowUp size={18} />
    </button>
  );
}
