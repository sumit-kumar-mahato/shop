import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import CategoryManager from "@/components/admin/CategoryManager";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <PageHeader title="Categories" description="Group products into departments shown in the menu and filters." />
      <CategoryManager
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description ?? "",
          image: c.image ?? "",
          gender: c.gender ?? "",
          sortOrder: c.sortOrder,
          isActive: c.isActive,
          productCount: c._count.products,
        }))}
      />
    </div>
  );
}
