"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { api, errorMessage } from "@/lib/fetcher";

export default function VerifyBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    setState("sending");
    setError(null);
    try {
      await api("/api/auth/resend-verification", { method: "POST", body: {} });
      setState("sent");
    } catch (err) {
      setError(errorMessage(err));
      setState("idle");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <MailWarning size={18} />
      <p className="flex-1">
        Please confirm your email <strong>{email}</strong>.{error && <span className="ml-1 text-red-600">{error}</span>}
      </p>
      {state === "sent" ? (
        <span className="font-semibold">Link sent — check your inbox.</span>
      ) : (
        <button onClick={resend} disabled={state === "sending"} className="font-semibold underline disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Resend verification email"}
        </button>
      )}
    </div>
  );
}
