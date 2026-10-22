"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circular circumference values for SVG dash calculation
  // Radius = 18, Circumference = 2 * Math.PI * 18 = 113.1
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 back-to-top-circle transition-opacity duration-300 shadow-lg ${
        visible ? "opacity-100 cursor-pointer pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-label="Back to Top"
    >
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 44 44">
        {/* Track Circle */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          className="text-zinc-100 dark:text-zinc-800"
          strokeWidth="2"
        />
        {/* Progress Circle */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="var(--primary-color, #c5a880)"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-75"
        />
      </svg>
      <ArrowUp size={16} className="text-zinc-800 dark:text-white relative z-10" />
    </button>
  );
}
