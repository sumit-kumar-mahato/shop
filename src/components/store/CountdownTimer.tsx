"use client";

import { useEffect, useState } from "react";

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Counts down to a real end date set in the admin panel (not a fake timer that resets on reload). */
export default function CountdownTimer({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt).getTime();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining(target));
    const t = setInterval(() => setTime(remaining(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (!time || Number.isNaN(target)) return null;
  if (time.done) return <p className="text-sm font-semibold text-red-600">This sale has ended.</p>;

  const units = [
    ...(time.days > 0 ? [{ label: "Days", value: time.days }] : []),
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ];
  return (
    <div className="flex gap-2" role="timer" aria-label="Time left in sale">
      {units.map((u) => (
        <div key={u.label} className="min-w-[56px] rounded-sm bg-luxury-900 px-2 py-2 text-center text-white dark:bg-zinc-800">
          <div className="font-mono text-xl font-bold tabular-nums">{String(u.value).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">{u.label}</div>
        </div>
      ))}
    </div>
  );
}
