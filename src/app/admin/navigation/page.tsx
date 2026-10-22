import { getSettings } from "@/lib/settings";
import { getLinkSuggestions, getPreviewPaths } from "@/lib/admin-links";
import { PageHeader, ViewStoreLink } from "@/components/admin/ui";
import NavigationEditor from "@/components/admin/NavigationEditor";

export const metadata = { title: "Menus & footer" };

export default async function AdminNavigation() {
  const [nav, { links }, paths] = await Promise.all([getSettings("navigation"), getLinkSuggestions(), getPreviewPaths()]);
  return (
    <div>
      <PageHeader title="Menus & footer" description="The links in your header menu and the columns, text and links in your footer." actions={<ViewStoreLink />} />
      <NavigationEditor initial={nav} suggestions={links} previewPaths={paths} />
    </div>
  );
}
