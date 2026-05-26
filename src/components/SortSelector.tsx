"use client";

import React from "react";

interface SortSelectorProps {
  currentSort: string;
}

const SortSelector: React.FC<SortSelectorProps> = ({ currentSort }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortVal = e.target.value;
    const query = new URLSearchParams(window.location.search);
    query.set("sort", sortVal);
    window.location.href = `/shop?${query.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-luxury-500 font-light hidden sm:inline">Sort:</span>
      <select
        defaultValue={currentSort || "featured"}
        onChange={handleChange}
        className="bg-white dark:bg-zinc-900 border border-luxury-200 dark:border-zinc-800 text-xs px-3 py-2 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-200"
      >
        <option value="featured">Featured</option>
        <option value="newest">Newest Arrivals</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Client Rating</option>
      </select>
    </div>
  );
};

export default SortSelector;
