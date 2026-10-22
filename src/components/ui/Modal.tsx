"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-lg animate-scale-in flex-col rounded-t-lg bg-white shadow-2xl outline-none dark:bg-zinc-900 sm:rounded-sm",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-luxury-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="font-serif text-lg text-luxury-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-luxury-500 hover:bg-luxury-100 dark:hover:bg-zinc-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-luxury-200 px-5 py-4 dark:border-zinc-800">{footer}</div>}
      </div>
    </div>
  );
}
