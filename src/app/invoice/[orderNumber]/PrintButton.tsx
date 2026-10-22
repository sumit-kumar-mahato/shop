"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-sm bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700">
      <Printer size={16} /> Print / Save as PDF
    </button>
  );
}
