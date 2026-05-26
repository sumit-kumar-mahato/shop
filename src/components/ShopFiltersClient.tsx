"use client";

import React, { useState } from "react";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ColorSwatch {
  name: string;
  code: string;
  border?: boolean;
}

interface ShopFiltersClientProps {
  categories: Category[];
  availableSizes: string[];
  availableColors: ColorSwatch[];
  searchParams: {
    gender?: string;
    category?: string;
    priceMax?: string;
    size?: string;
    color?: string;
    fabric?: string;
    search?: string;
  };
  isMobile?: boolean;
}

const ShopFiltersClient: React.FC<ShopFiltersClientProps> = ({
  categories,
  availableSizes,
  availableColors,
  searchParams,
  isMobile = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(searchParams.priceMax || "");
  const [fabric, setFabric] = useState(searchParams.fabric || "");

  const updateParam = (key: string, value: string) => {
    const query = new URLSearchParams(window.location.search);
    if (value) {
      query.set(key, value);
    } else {
      query.delete(key);
    }
    // Maintain page position or reload
    window.location.href = `/shop?${query.toString()}`;
  };

  const clearAll = () => {
    window.location.href = "/shop";
  };

  const filterContent = (
    <div className="space-y-8">
      {/* Category List */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Categories</h4>
        <div className="flex flex-col space-y-2.5">
          <button
            onClick={() => updateParam("category", "")}
            className={`text-left text-xs font-medium tracking-wide pb-1 hover:text-luxury-gold transition-colors ${
              !searchParams.category ? "text-luxury-gold font-bold" : "text-luxury-600 dark:text-zinc-400"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={`text-left text-xs font-medium tracking-wide pb-1 hover:text-luxury-gold transition-colors ${
                searchParams.category === cat.slug ? "text-luxury-gold font-bold" : "text-luxury-600 dark:text-zinc-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filters */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Gender</h4>
        <div className="flex flex-wrap gap-2">
          {["Men", "Women", "Kids", "Unisex"].map((g) => (
            <button
              key={g}
              onClick={() => updateParam("gender", searchParams.gender === g ? "" : g)}
              className={`text-xs px-3.5 py-1.5 border rounded-sm font-semibold transition-all ${
                searchParams.gender === g
                  ? "bg-luxury-900 border-luxury-900 text-white dark:bg-luxury-gold dark:border-luxury-gold dark:text-zinc-950"
                  : "border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-luxury-gold"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes Filters */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Select Size</h4>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((sz) => (
            <button
              key={sz}
              onClick={() => updateParam("size", searchParams.size === sz ? "" : sz)}
              className={`w-10 h-10 border text-[11px] font-bold flex items-center justify-center transition-all ${
                searchParams.size === sz
                  ? "bg-luxury-900 border-luxury-900 text-white dark:bg-luxury-gold dark:border-luxury-gold dark:text-zinc-950"
                  : "border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-luxury-gold"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Colors Filters */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Color</h4>
        <div className="flex flex-wrap gap-3">
          {availableColors.map((col) => (
            <button
              key={col.name}
              onClick={() => updateParam("color", searchParams.color === col.name ? "" : col.name)}
              className={`w-7 h-7 rounded-full transition-all relative flex items-center justify-center ${
                col.border ? "border border-luxury-300" : ""
              } ${searchParams.color === col.name ? "ring-2 ring-luxury-gold ring-offset-2 dark:ring-offset-zinc-950" : ""}`}
              style={{ backgroundColor: col.code }}
              title={col.name}
            >
              {searchParams.color === col.name && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    col.name === "White" ? "bg-black" : "bg-white"
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fabric / Material */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Fabric</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Linen, Silk, Cotton..."
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            className="w-full bg-transparent border border-luxury-200 dark:border-zinc-800 text-xs p-2 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
          />
          <button
            onClick={() => updateParam("fabric", fabric)}
            className="bg-luxury-900 text-white px-3 py-2 text-xs font-bold hover:bg-luxury-gold transition-colors dark:bg-zinc-800 rounded-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Price Slider Filter */}
      <div>
        <h4 className="text-xs font-bold tracking-widest text-luxury-900 dark:text-white uppercase mb-4">Max Price</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-luxury-500 font-light">₹0</span>
            <input
              type="range"
              min="0"
              max="15000"
              step="500"
              value={priceMax || "15000"}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full accent-luxury-gold cursor-pointer"
            />
            <span className="text-xs text-luxury-500 font-light">₹15k+</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-xs font-bold">Limit: ₹{priceMax || "15,000"}</span>
            <button
              onClick={() => updateParam("priceMax", priceMax)}
              className="text-[11px] font-bold text-luxury-gold hover:underline"
            >
              APPLY LIMIT
            </button>
          </div>
        </div>
      </div>

      {/* Reset Filter Button */}
      <button
        onClick={clearAll}
        className="w-full border border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-red-500 hover:text-red-500 transition-colors font-bold text-xs tracking-widest py-3 uppercase rounded-sm"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 border border-luxury-200 dark:border-zinc-800 text-xs px-4 py-2 font-semibold hover:border-luxury-gold transition-colors text-zinc-800 dark:text-zinc-200 rounded"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <div className="relative w-80 max-w-sm bg-white dark:bg-zinc-900 h-full p-6 flex flex-col shadow-2xl z-10 animate-fade-in-up overflow-y-auto">
              <div className="flex items-center justify-between border-b border-luxury-100 dark:border-zinc-800 pb-4 mb-6">
                <span className="font-display font-bold tracking-widest text-sm text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                  <SlidersHorizontal size={14} /> Shop Filters
                </span>
                <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={18} />
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 font-display font-bold text-sm tracking-widest text-zinc-900 dark:text-white border-b border-luxury-200 dark:border-zinc-800 pb-3 uppercase">
        <SlidersHorizontal size={15} className="text-luxury-gold" />
        <span>Shop Filters</span>
      </div>
      {filterContent}
    </div>
  );
};

export default ShopFiltersClient;
