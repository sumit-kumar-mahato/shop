import type { OrderStatus } from "@prisma/client";
import { Check } from "lucide-react";
import { ORDER_STATUS_LABELS, TRACKING_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function OrderTracker({ status }: { status: OrderStatus }) {
  const returned = status === "RETURN_REQUESTED" || status === "RETURNED";
  const current = returned ? TRACKING_STEPS.length - 1 : TRACKING_STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {TRACKING_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={cn("absolute right-1/2 top-3.5 h-0.5 w-full", i <= current ? "bg-green-600" : "bg-luxury-200 dark:bg-zinc-700")} aria-hidden />}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                done ? "border-green-600 bg-green-600 text-white" : "border-luxury-300 bg-white text-luxury-400 dark:border-zinc-600 dark:bg-zinc-900",
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span className={cn("mt-2 text-[11px] leading-tight sm:text-xs", done ? "font-semibold" : "text-luxury-500")}>{ORDER_STATUS_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
