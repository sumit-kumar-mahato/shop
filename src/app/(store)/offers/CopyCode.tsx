"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable
        }
      }}
      className="mt-5 flex w-full items-center justify-between rounded-sm bg-luxury-100 px-4 py-3 font-mono text-sm font-bold tracking-widest dark:bg-zinc-800"
      aria-label={`Copy code ${code}`}
    >
      {code}
      <span className="flex items-center gap-1 font-sans text-xs font-semibold tracking-normal text-luxury-600 dark:text-zinc-400">
        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
      </span>
    </button>
  );
}
