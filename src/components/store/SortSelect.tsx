"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = {
  featured: "Featured",
  newest: "Newest",
  popular: "Best selling",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
};

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-luxury-500">Sort by</span>
      <select
        value={value in OPTIONS ? value : "featured"}
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          if (e.target.value === "featured") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="h-10 rounded-sm border border-luxury-200 bg-white px-2 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-900"
      >
        {Object.entries(OPTIONS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
