import { getSettings } from "@/lib/settings";
import { getPreviewPaths } from "@/lib/admin-links";
import { PageHeader, ViewStoreLink } from "@/components/admin/ui";
import AppearanceEditor from "@/components/admin/AppearanceEditor";

export const metadata = { title: "Appearance" };

export default async function AdminAppearance() {
  const [theme, store, paths] = await Promise.all([getSettings("theme"), getSettings("store"), getPreviewPaths()]);
  return (
    <div>
      <PageHeader
        title="Appearance"
        description="Your store's look: colour, fonts, shapes, logo, product cards and dark mode."
        actions={<ViewStoreLink />}
      />
      <AppearanceEditor initial={theme} logoText={store.logoText} previewPaths={paths} />
    </div>
  );
}
