"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, X } from "lucide-react";
import type { EngagementSettings } from "@/lib/settings-schema";
import SmartImage from "@/components/ui/SmartImage";
import NewsletterForm from "./NewsletterForm";

const SEEN_KEY = "pkm_popup_seen";
// Never interrupt someone who is paying, signing in or managing their account.
const QUIET_PATHS = ["/checkout", "/cart", "/login", "/register", "/account", "/forgot-password", "/reset-password", "/verify-email"];

/** Welcome / offer popup configured in Admin → Popups & chat. Shown once per visitor per N days. */
export default function WelcomePopup({ popup, preview }: { popup: EngagementSettings["popup"]; preview?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!popup.enabled) return;
    if (QUIET_PATHS.some((p) => pathname.startsWith(p))) return;
    if (popup.showOn === "home" && pathname !== "/") return;
    if (!preview) {
      try {
        const seen = Number(localStorage.getItem(SEEN_KEY) || 0);
        if (seen && Date.now() - seen < popup.frequencyDays * 86_400_000) return;
      } catch {
        return; // storage blocked — don't risk showing it on every page
      }
    }
    const t = setTimeout(() => setOpen(true), preview ? 600 : popup.delaySeconds * 1000);
    return () => clearTimeout(t);
  }, [pathname, popup.enabled, popup.showOn, popup.delaySeconds, popup.frequencyDays, preview]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(popup.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — the code is still visible
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative grid w-full max-w-3xl animate-scale-in overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-950 sm:rounded-sm md:grid-cols-2">
        {popup.image && <SmartImage src={popup.image} alt="" className="hidden min-h-[440px] md:block" />}
        <div className="relative flex flex-col justify-center gap-4 p-8 sm:p-10">
          <button ref={closeRef} onClick={close} className="absolute right-3 top-3 rounded-full p-2 text-luxury-500 hover:bg-luxury-100 dark:hover:bg-zinc-800" aria-label="Close">
            <X size={18} />
          </button>
          {popup.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{popup.eyebrow}</p>}
          <h2 id="welcome-title" className="font-serif text-3xl leading-tight sm:text-4xl">{popup.title}</h2>
          {popup.text && <p className="text-sm leading-relaxed text-luxury-600 dark:text-zinc-400">{popup.text}</p>}
          {popup.couponCode && (
            <button onClick={copy} className="group flex items-center justify-between rounded-sm border-2 border-dashed border-brand/60 bg-brand/5 px-4 py-3 text-left">
              <span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-luxury-500">Your code</span>
                <span className="font-mono text-lg font-bold tracking-widest">{popup.couponCode}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-brand">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </span>
            </button>
          )}
          {popup.collectEmail && <NewsletterForm id="nl-popup" compact />}
          {popup.buttonText && popup.link && (
            <Link href={popup.link} onClick={close} className="inline-flex h-12 items-center justify-center rounded-btn bg-luxury-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-brand hover:text-brand-fg dark:bg-white dark:text-zinc-900">
              {popup.buttonText}
            </Link>
          )}
          <button onClick={close} className="text-xs text-luxury-500 underline-offset-4 hover:underline">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
