"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/lib/money";

type Point = { date: string; revenue: number; orders: number };

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function RevenueChart({ data }: { data: Point[] }) {
  const dark = useDarkMode();
  // Light mode uses a darker taupe for 3:1+ contrast on white; dark mode uses the brand gold.
  const stroke = dark ? "#c5a880" : "#756d59";
  const grid = dark ? "#27272a" : "#f0eee8";
  const axis = dark ? "#a1a1aa" : "#71717a";

  return (
    <div className="h-72 w-full" role="img" aria-label="Daily revenue for the last 30 days">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis
            tickFormatter={(v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(v >= 1000000 ? 0 : 1)}k` : `₹${Math.round(v / 100)}`)}
            tick={{ fontSize: 11, fill: axis }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            cursor={{ stroke: axis, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="font-medium text-zinc-500">{new Date(p.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                  <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">{formatINR(p.revenue)}</p>
                  <p className="text-zinc-500">{p.orders} {p.orders === 1 ? "order" : "orders"}</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="revenue" stroke={stroke} strokeWidth={2} fill="url(#revFill)" activeDot={{ r: 4, strokeWidth: 2, stroke: dark ? "#18181b" : "#fff" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
