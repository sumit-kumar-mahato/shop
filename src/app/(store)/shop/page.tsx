import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, X } from "lucide-react";
import { prisma } from "@/lib/db";
import { getShopFacets, searchShop, type ShopParams } from "@/lib/catalog";
import { GENDER_FROM_PARAM, GENDER_LABELS } from "@/lib/constants";
import ShopFilters from "@/components/store/ShopFilters";
import ShopResults from "@/components/store/ShopResults";
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
    const cat = await prisma.category.findUnique({ where: { slug: params.category }, select: { name: true, description: true, image: true } });
    if (cat) return { title: cat.name, description: cat.description, image: cat.image, eyebrow: "Collection" };
  }
  const g = params.gender ? GENDER_FROM_PARAM[params.gender.toLowerCase()] : undefined;
  if (g) return { title: `${GENDER_LABELS[g]}`, description: "Everyday essentials, occasion wear and timeless pieces.", image: null, eyebrow: "Shop" };
  if (params.q) return { title: `“${params.q}”`, description: null, image: null, eyebrow: "Search results" };
  if (params.sale === "1") return { title: "On Sale", description: "Limited-time prices on selected styles.", image: null, eyebrow: "Offers" };
  return { title: "Shop All", description: "Handwoven silks, fine linens, everyday cottons and denim — all in one place.", image: null, eyebrow: "The collection" };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const h = await heading(normalize(searchParams));
  return { title: h.title.replace(/[“”]/g, ""), description: h.description ?? undefined };
}

/** Removable chips for the active filters. */
function activeChips(params: ShopParams, current: URLSearchParams) {
  const chips: Array<{ label: string; href: string }> = [];
  const without = (key: string | string[], value?: string) => {
    const next = new URLSearchParams(current);
    next.delete("page");
    if (Array.isArray(key)) key.forEach((k) => next.delete(k));
    else if (value === undefined) next.delete(key);
    else {
      const rest = (next.get(key) ?? "").split(",").filter((v) => v && v !== value);
      if (rest.length) next.set(key, rest.join(","));
      else next.delete(key);
    }
    const qs = next.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };
  for (const key of ["gender", "size", "color"] as const) {
    for (const v of (params[key] ?? "").split(",").filter(Boolean)) {
      chips.push({ label: key === "gender" ? GENDER_LABELS[GENDER_FROM_PARAM[v.toLowerCase()]] ?? v : v, href: without(key, v) });
    }
  }
  if (params.min || params.max) chips.push({ label: `₹${params.min || 0} – ${params.max ? `₹${params.max}` : "any"}`, href: without(["min", "max"]) });
  if (params.sale === "1") chips.push({ label: "On sale", href: without("sale") });
  if (params.instock === "1") chips.push({ label: "In stock", href: without("instock") });
  return chips;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = normalize(searchParams);
  const [result, facets, head] = await Promise.all([searchShop(params), getShopFacets(), heading(params)]);
  const activeFilters = (["q", "category", "gender", "size", "color", "min", "max", "sale", "instock"] as const).filter((k) => params[k]).length;
  const current = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1])));
  const chips = activeChips(params, current);

  return (
    <div>
      {head.image ? (
        <section className="relative flex h-[320px] items-end overflow-hidden bg-zinc-900 text-white sm:h-[400px]">
          <img src={head.image} alt="" className="absolute inset-0 h-full w-full animate-kenburns object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="container-page relative pb-10">
            <nav className="mb-4 text-xs text-white/70" aria-label="Breadcrumb">
              <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline">Shop</Link>
            </nav>
            <p className="animate-fade-in-up text-xs font-semibold uppercase tracking-[0.3em] text-brand">{head.eyebrow}</p>
            <h1 className="mt-2 animate-fade-in-up font-serif text-5xl sm:text-7xl">{head.title}</h1>
            {head.description && <p className="mt-3 max-w-xl animate-fade-in-up text-white/80">{head.description}</p>}
          </div>
        </section>
      ) : (
        <section className="container-page pb-6 pt-10 sm:pt-14">
          <nav className="mb-6 text-xs text-luxury-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link> / <span>Shop</span>
          </nav>
          <p className="animate-fade-in-up text-xs font-semibold uppercase tracking-[0.3em] text-brand">{head.eyebrow}</p>
          <h1 className="mt-2 animate-fade-in-up font-serif text-5xl sm:text-7xl">{head.title}</h1>
          {head.description && <p className="mt-3 max-w-2xl animate-fade-in-up text-luxury-600 dark:text-zinc-400">{head.description}</p>}
        </section>
      )}

      <div className="container-page mt-10 grid gap-10 lg:grid-cols-[250px_1fr]">
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <ShopFilters facets={facets} params={params} activeCount={activeFilters} />
        </div>

        <div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <Link key={c.label + c.href} href={c.href} scroll={false} className="group inline-flex items-center gap-1.5 rounded-full bg-luxury-900 py-1.5 pl-3.5 pr-2.5 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                  {c.label} <X size={13} className="opacity-70 group-hover:opacity-100" />
                </Link>
              ))}
              <Link href={params.q ? `/shop?q=${encodeURIComponent(params.q)}` : "/shop"} className="ml-1 text-xs font-semibold underline-offset-4 hover:underline">
                Clear all
              </Link>
            </div>
          )}
          {result.products.length === 0 ? (
            <EmptyState
              icon={<SearchX size={40} />}
              title="No products found"
              description="Try removing a filter or searching for something else."
              action={<LinkButton href="/shop" variant="outline">Clear all filters</LinkButton>}
            />
          ) : (
            <>
              <ShopResults products={result.products} total={result.total} sort={params.sort ?? "featured"} />
              <Pagination page={result.page} pageCount={result.pageCount} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
