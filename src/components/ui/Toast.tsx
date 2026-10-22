"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; tone: ToastTone; message: string };

const ToastContext = createContext<{ toast: (message: string, tone?: ToastTone) => void } | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => setItems((prev) => prev.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId++;
      setItems((prev) => [...prev.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-4 sm:translate-x-0" aria-live="polite">
        {items.map((t) => {
          const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "error" ? AlertCircle : Info;
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex animate-fade-in-up items-start gap-3 rounded-sm border bg-white px-4 py-3 text-sm shadow-lg dark:bg-zinc-900",
                t.tone === "success" && "border-green-200 dark:border-green-900",
                t.tone === "error" && "border-red-200 dark:border-red-900",
                t.tone === "info" && "border-luxury-200 dark:border-zinc-700",
              )}
              role={t.tone === "error" ? "alert" : "status"}
            >
              <Icon
                size={18}
                className={cn("mt-0.5 flex-shrink-0", t.tone === "success" && "text-green-600", t.tone === "error" && "text-red-600", t.tone === "info" && "text-brand")}
              />
              <p className="flex-1 text-luxury-900 dark:text-zinc-100">{t.message}</p>
              <button onClick={() => dismiss(t.id)} className="text-luxury-400 hover:text-luxury-900 dark:hover:text-white" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx.toast;
}
