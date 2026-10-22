import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { AdminPagination, PageHeader, Panel, Table, Td, Th, withParams } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import ProductRowActions from "@/components/admin/ProductRowActions";

export const metadata = { title: "Products" };
const PER_PAGE = 25;

type SP = { q?: string; status?: string; category?: string; stock?: string; page?: string };

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const where: Prisma.ProductWhereInput = {};
  const q = searchParams.q?.trim();
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { variants: { some: { sku: { contains: q, mode: "insensitive" } } } }];
  if (searchParams.status && ["DRAFT", "ACTIVE", "ARCHIVED"].includes(searchParams.status)) where.status = searchParams.status as Prisma.EnumProductStatusFilter["equals"];
  if (searchParams.category) where.categoryId = searchParams.category;
  if (searchParams.stock === "out") where.variants = { every: { stock: { lte: 0 } } };
  if (searchParams.stock === "low") where.variants = { some: { stock: { gt: 0, lte: 5 } } };

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { category: { select: { name: true } }, variants: { select: { stock: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

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
      <Panel padded={false}>
        <form className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800">
          <input name="q" defaultValue={q} placeholder="Search title or SKU…" className="h-10 min-w-[200px] flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950" />
          <select name="status" defaultValue={searchParams.status ?? ""} className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select name="category" defaultValue={searchParams.category ?? ""} className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="stock" defaultValue={searchParams.stock ?? ""} className="h-10 rounded-md border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <button className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">Filter</button>
        </form>

        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No products found.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>Stock</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-right">Sold</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <Td>
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                        <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
                          {p.images[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="font-medium hover:underline">{p.title}</span>
                      </Link>
                    </Td>
                    <Td>
                      <Badge tone={p.status === "ACTIVE" ? "green" : p.status === "DRAFT" ? "amber" : "neutral"}>{p.status.toLowerCase()}</Badge>
                    </Td>
                    <Td>
                      <span className={stock === 0 ? "font-medium text-red-600" : stock <= 5 ? "font-medium text-amber-600" : ""}>{stock}</span>
                      <span className="text-zinc-500"> · {p.variants.length} {p.variants.length === 1 ? "variant" : "variants"}</span>
                    </Td>
                    <Td className="text-zinc-500">{p.category?.name ?? "—"}</Td>
                    <Td className="text-right tabular-nums">{formatINR(p.price)}</Td>
                    <Td className="text-right tabular-nums text-zinc-500">{p.salesCount}</Td>
                    <Td className="text-right">
                      <ProductRowActions id={p.id} slug={p.slug} status={p.status} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => withParams("/admin/products", searchParams, { page: p })} />
      </Panel>
    </div>
  );
}
