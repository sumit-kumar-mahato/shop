import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, SlidersHorizontal, Search, RefreshCw, X } from "lucide-react";
import { prisma } from "@/lib/db";
import ShopFiltersClient from "@/components/ShopFiltersClient";
import SortSelector from "@/components/SortSelector";

// Helper to safely parse JSON
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

interface ShopPageProps {
  searchParams: {
    gender?: string;
    category?: string;
    priceMax?: string;
    size?: string;
    color?: string;
    fabric?: string;
    search?: string;
    sort?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // 1. Fetch all raw categories for filter list
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany();
  } catch (e) {}

  // 2. Fetch all products from DB
  let rawProducts: any[] = [];
  try {
    rawProducts = await prisma.product.findMany();
  } catch (e) {}

  // 3. Filter products in-memory for 100% SQLite JSON-compatibility
  let filteredProducts = rawProducts.filter((product) => {
    // Gender filter
    if (searchParams.gender && product.gender.toLowerCase() !== searchParams.gender.toLowerCase()) {
      return false;
    }

    // Category filter
    if (searchParams.category && product.categoryName.toLowerCase() !== searchParams.category.toLowerCase()) {
      return false;
    }

    // Max Price filter
    if (searchParams.priceMax) {
      const maxP = parseFloat(searchParams.priceMax);
      if (!isNaN(maxP) && product.price > maxP) {
        return false;
      }
    }

    // Size filter (stored as JSON array string)
    if (searchParams.size) {
      const sizes = safeParse(product.sizes);
      if (!sizes.includes(searchParams.size)) {
        return false;
      }
    }

    // Color filter (stored as JSON array string)
    if (searchParams.color) {
      const colors = safeParse(product.colors);
      if (!colors.includes(searchParams.color)) {
        return false;
      }
    }

    // Fabric filter
    if (searchParams.fabric && !product.fabric.toLowerCase().includes(searchParams.fabric.toLowerCase())) {
      return false;
    }

    // Search query filter
    if (searchParams.search) {
      const q = searchParams.search.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.categoryName.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) {
        return false;
      }
    }

    return true;
  });

  // 4. Sort products
  if (searchParams.sort) {
    if (searchParams.sort === "price-asc") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (searchParams.sort === "price-desc") {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else if (searchParams.sort === "rating") {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (searchParams.sort === "newest") {
      filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  // Common sizes and colors for filter buttons
  const availableSizes = ["XS", "S", "M", "L", "XL", "Free Size", "30", "32", "34", "36"];
  const availableColors = [
    { name: "White", code: "#FFFFFF", border: true },
    { name: "Black", code: "#000000" },
    { name: "Red", code: "#DC2626" },
    { name: "Amber", code: "#D97706" },
    { name: "Blue", code: "#1E3A8A" },
    { name: "Charcoal", code: "#374151" },
    { name: "Gray", code: "#9CA3AF" },
    { name: "Gold", code: "#c5a880" }
  ];

  const activeFiltersCount = Object.keys(searchParams).filter(
    (k) => k !== "sort" && searchParams[k as keyof typeof searchParams]
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-luxury-100 dark:bg-zinc-900 py-12 px-6 text-center space-y-3 mb-10 rounded-sm">
        <h1 className="serif-header text-3xl sm:text-4xl font-normal uppercase tracking-wide">
          {searchParams.category ? `${searchParams.category} Collection` : searchParams.gender ? `${searchParams.gender}'s Collection` : "Boutique Shop"}
        </h1>
        <p className="text-xs text-luxury-500 font-light tracking-wide max-w-md mx-auto leading-relaxed">
          Discover hand-finished linens, designer ethnic garments, pure cotton daily basics, and heritage accessories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop (Server/Client Hybrid) */}
        <div className="hidden lg:block space-y-8 border-r border-luxury-200/50 dark:border-zinc-800/50 pr-8">
          <ShopFiltersClient
            categories={categories}
            availableSizes={availableSizes}
            availableColors={availableColors}
            searchParams={searchParams}
          />
        </div>

        {/* Product Grid & Sort Header */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-luxury-200/40 dark:border-zinc-800/40 pb-4">
            <div>
              <p className="text-xs text-luxury-500 font-light">
                Showing <span className="font-semibold text-luxury-900 dark:text-white">{filteredProducts.length}</span> products
              </p>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] bg-luxury-gold/15 text-luxury-600 dark:text-luxury-gold px-2 py-0.5 rounded font-bold uppercase">
                    {activeFiltersCount} active filter{activeFiltersCount > 1 ? "s" : ""}
                  </span>
                  <Link href="/shop" className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-0.5">
                    Clear <X size={10} />
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Filter & Sort Buttons Wrapper */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Mobile Filter Button */}
              <div className="block lg:hidden">
                <ShopFiltersClient
                  categories={categories}
                  availableSizes={availableSizes}
                  availableColors={availableColors}
                  searchParams={searchParams}
                  isMobile
                />
              </div>

              {/* Sort Selector */}
              <SortSelector currentSort={searchParams.sort || "featured"} />
            </div>
          </div>

          {/* No products feedback */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-luxury-100/50 dark:bg-zinc-900/30 rounded border border-dashed border-luxury-200 dark:border-zinc-800">
              <p className="text-sm text-luxury-500 font-light">No products match your chosen filters.</p>
              <Link href="/shop" className="inline-block mt-4 bg-luxury-900 text-white text-xs font-bold tracking-widest px-6 py-2.5 rounded-sm hover:bg-luxury-gold hover:text-zinc-950 transition-colors">
                RESET ALL FILTERS
              </Link>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const productImages = safeParse(product.images);
              const sizes = safeParse(product.sizes);
              const colors = safeParse(product.colors);
              return (
                <div key={product.id} className="group flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md relative">
                  {/* Image wrapper */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
                    <Image
                      src={productImages[0] || "/placeholder.jpg"}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.compareAtPrice && (
                      <span className="absolute top-2 left-2 bg-luxury-gold text-zinc-950 text-[10px] font-bold px-2 py-0.5 uppercase rounded-sm">
                        -{product.discountPercentage}% OFF
                      </span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded-sm">
                        Low Stock ({product.stock})
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold tracking-widest uppercase">
                        Sold Out
                      </span>
                    )}
                    <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
                  </div>

                  {/* Text details */}
                  <div className="flex flex-col space-y-1 flex-grow">
                    <div className="flex justify-between items-center text-[10px] text-luxury-500 font-bold uppercase">
                      <span>{product.categoryName}</span>
                      <div className="flex items-center text-amber-500">
                        <Star size={10} fill="currentColor" className="mr-0.5" />
                        <span>{product.rating}</span>
                      </div>
                    </div>
                    <Link href={`/product/${product.id}`} className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1">
                      {product.title}
                    </Link>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-luxury-100/60 dark:border-zinc-800/40">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-luxury-900 dark:text-white">₹{product.price}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-luxury-400 dark:text-zinc-500 line-through">₹{product.compareAtPrice}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-luxury-400 font-semibold uppercase">
                        {sizes.length} Size{sizes.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
