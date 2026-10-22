import { getSettings } from "@/lib/settings";
import { getLinkSuggestions, getPreviewPaths } from "@/lib/admin-links";
import { PageHeader, ViewStoreLink } from "@/components/admin/ui";
import HomepageEditor from "@/components/admin/HomepageEditor";

export const metadata = { title: "Homepage" };

export default async function AdminHomepage() {
  const [home, { links, categories }, paths] = await Promise.all([getSettings("homepage"), getLinkSuggestions(), getPreviewPaths()]);
  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Build your homepage from sections: reorder, show or hide them, and add new content blocks. Turn on Live preview to see changes before publishing."
        actions={<ViewStoreLink href="/" label="View homepage" />}
      />
      <HomepageEditor initial={home} ctx={{ suggestions: links, categories }} previewPaths={paths.slice(0, 1)} />
    </div>
  );
}
