"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-luxury-600 dark:text-zinc-400">We hit an unexpected problem. Please try again — if it keeps happening, contact us.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-luxury-400">Reference: {error.digest}</p>}
      <button onClick={reset} className="mt-8 inline-flex h-11 items-center rounded-sm bg-luxury-900 px-6 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
        Try again
      </button>
    </div>
  );
}
