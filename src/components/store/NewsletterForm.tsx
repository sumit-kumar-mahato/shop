"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

export default function NewsletterForm({ compact, dark }: { compact?: boolean; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      await api("/api/newsletter", { body: { email } });
      setState("done");
      setMessage("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className={cn("flex gap-2", !compact && "flex-col sm:flex-row")}>
        <label htmlFor={compact ? "nl-footer" : "nl-home"} className="sr-only">Email address</label>
        <input
          id={compact ? "nl-footer" : "nl-home"}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={cn(
            "h-11 min-w-0 flex-1 rounded-sm border px-3 text-sm focus:border-brand focus:outline-none",
            dark ? "border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500" : "border-luxury-200 bg-white dark:border-zinc-700 dark:bg-zinc-950",
          )}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={cn(
            "h-11 rounded-sm px-5 text-sm font-semibold transition-colors disabled:opacity-60",
            dark ? "bg-white text-zinc-950 hover:bg-brand" : "bg-luxury-900 text-white hover:bg-luxury-800 dark:bg-white dark:text-zinc-900",
          )}
        >
          {state === "loading" ? "…" : "Subscribe"}
        </button>
      </div>
      {message && (
        <p className={cn("text-xs", state === "error" ? "text-red-500" : dark ? "text-green-400" : "text-green-700 dark:text-green-400")} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
