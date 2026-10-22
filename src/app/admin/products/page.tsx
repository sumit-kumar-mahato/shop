import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { PRODUCT_FLAGS, type ProductFlag } from "@/lib/constants";
import { AdminPagination, PageHeader, Panel, withParams } from "@/components/admin/ui";
import { LinkButton } from "@/components/ui/Button";
import ProductTable from "@/components/admin/ProductTable";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products" };
const PER_PAGE = 25;

type SP = { q?: string; status?: string; category?: string; stock?: string; flag?: string; page?: string };
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;
const isFlag = (f: string | undefined): f is ProductFlag => Boolean(f && f in PRODUCT_FLAGS);

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const store = await getSettings("store");
  const lowAt = store.orders.lowStockThreshold;

  const base: Prisma.ProductWhereInput = {};
  const q = searchParams.q?.trim();
  if (q) base.OR = [{ title: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }];
  if (searchParams.category) base.categoryId = searchParams.category;
  if (searchParams.stock === "out") base.variants = { every: { stock: { lte: 0 } } };
  if (searchParams.stock === "low") base.variants = { some: { stock: { gt: 0, lte: lowAt } } };
  if (isFlag(searchParams.flag)) base[searchParams.flag] = true;
  const status = STATUSES.find((s) => s === searchParams.status);
  const where: Prisma.ProductWhereInput = status ? { ...base, status } : base;

  const [total, products, categories, counts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
  ]);
  const countOf = (s?: string) => (s ? counts.find((c) => c.status === s)?._count._all ?? 0 : counts.reduce((n, c) => n + c._count._all, 0));

  const selectCls = "h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${total} ${total === 1 ? "product" : "products"}`}
        actions={
          <LinkButton href="/admin/products/new" size="sm">
            <Plus size={16} /> Add product
          </LinkButton>
        }
      />
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto">
        {[undefined, ...STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={withParams("/admin/products", { ...searchParams, page: undefined }, { status: s })}
            className={cn(
              "flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm",
              status === s ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            {s ? s.charAt(0) + s.slice(1).toLowerCase() : "All"}
            <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", status === s ? "bg-white/20 dark:bg-zinc-900/10" : "bg-zinc-200 dark:bg-zinc-800")}>{countOf(s)}</span>
          </Link>
        ))}
      </div>
      <Panel padded={false}>
        <form className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search title or SKU…" className="h-10 min-w-[200px] flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          <select name="category" defaultValue={searchParams.category ?? ""} className={selectCls}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="stock" defaultValue={searchParams.stock ?? ""} className={selectCls}>
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select name="flag" defaultValue={searchParams.flag ?? ""} className={selectCls}>
            <option value="">Any placement</option>
            {(Object.keys(PRODUCT_FLAGS) as ProductFlag[]).map((f) => (
              <option key={f} value={f}>{PRODUCT_FLAGS[f]}</option>
            ))}
          </select>
          <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">Filter</button>
        </form>

        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No products found.</p>
        ) : (
          <ProductTable
            lowStockAt={lowAt}
            rows={products.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              image: p.images[0] ?? null,
              status: p.status,
              stock: p.variants.reduce((s, v) => s + v.stock, 0),
              variantCount: p.variants.length,
              category: p.category?.name ?? null,
              price: p.price,
              salesCount: p.salesCount,
              flags: (Object.keys(PRODUCT_FLAGS) as ProductFlag[]).filter((f) => p[f]),
            }))}
          />
        )}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => withParams("/admin/products", searchParams, { page: p })} />
      </Panel>
    </div>
  );
}
