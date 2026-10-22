import { getSettings } from "@/lib/settings";
import { getPreviewPaths } from "@/lib/admin-links";
import { PageHeader } from "@/components/admin/ui";
import ProductPageEditor from "@/components/admin/ProductPageEditor";

export const metadata = { title: "Product page" };

export default async function AdminProductPage() {
  const [page, paths] = await Promise.all([getSettings("productPage"), getPreviewPaths()]);
  // Preview a real product first.
  const ordered = [...paths.filter((p) => p.href.startsWith("/product/")), ...paths.filter((p) => !p.href.startsWith("/product/"))];
  return (
    <div>
      <PageHeader title="Product page" description="What every product page shows: delivery info, highlights, the size guide and the sections below the product." />
      <ProductPageEditor initial={page} previewPaths={ordered} />
    </div>
  );
}
