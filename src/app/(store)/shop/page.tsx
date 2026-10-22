import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { prisma } from "@/lib/db";
import { getShopFacets, searchShop, type ShopParams } from "@/lib/catalog";
import { GENDER_FROM_PARAM, GENDER_LABELS } from "@/lib/constants";
import { ProductGrid } from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import SortSelect from "@/components/store/SortSelect";
import Pagination from "@/components/store/Pagination";
import { EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";

type Props = { searchParams: Record<string, string | string[] | undefined> };

function normalize(sp: Props["searchParams"]): ShopParams {
  const pick = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.slice(0, 200);
  };
  return {
    q: pick("q") ?? pick("search"),
    category: pick("category"),
    gender: pick("gender"),
    size: pick("size"),
    color: pick("color"),
    min: pick("min"),
    max: pick("max") ?? pick("priceMax"),
    sale: pick("sale"),
    instock: pick("instock"),
    sort: pick("sort"),
    page: pick("page"),
  };
}

async function heading(params: ShopParams) {
  if (params.category) {
    const cat = await prisma.category.findUnique({ where: { slug: params.category }, select: { name: true, description: true } });
    if (cat) return { title: cat.name, description: cat.description };
  }
  const g = params.gender ? GENDER_FROM_PARAM[params.gender.toLowerCase()] : undefined;
  if (g) return { title: `${GENDER_LABELS[g]}'s Collection`, description: null };
  if (params.q) return { title: `Results for “${params.q}”`, description: null };
  if (params.sale === "1") return { title: "On Sale", description: null };
  return { title: "Shop All", description: "Handwoven silks, fine linens, everyday cottons and denim — all in one place." };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const h = await heading(normalize(searchParams));
  return { title: h.title, description: h.description ?? undefined };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = normalize(searchParams);
  const [result, facets, head] = await Promise.all([searchShop(params), getShopFacets(), heading(params)]);
  const activeFilters = (["q", "category", "gender", "size", "color", "min", "max", "sale", "instock"] as const).filter((k) => params[k]).length;

  return (
    <div className="container-page py-10">
      <div className="mb-8 border-b border-luxury-200 pb-6 dark:border-zinc-800">
        <nav className="mb-3 text-xs text-luxury-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link> / <span>Shop</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-4xl">{head.title}</h1>
        {head.description && <p className="mt-2 max-w-2xl text-sm text-luxury-600 dark:text-zinc-400">{head.description}</p>}
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <ShopFilters facets={facets} params={params} activeCount={activeFilters} />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-luxury-600 dark:text-zinc-400">
              <span className="font-semibold text-luxury-900 dark:text-white">{result.total}</span> {result.total === 1 ? "product" : "products"}
            </p>
            <SortSelect value={params.sort ?? "featured"} />
          </div>

          {result.products.length === 0 ? (
            <EmptyState
              icon={<SearchX size={40} />}
              title="No products found"
              description="Try removing a filter or searching for something else."
              action={<LinkButton href="/shop" variant="outline">Clear all filters</LinkButton>}
            />
          ) : (
            <>
              <ProductGrid products={result.products} className="lg:grid-cols-3 xl:grid-cols-4" />
              <Pagination page={result.page} pageCount={result.pageCount} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
