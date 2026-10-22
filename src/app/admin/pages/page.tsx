import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import PagesEditor from "@/components/admin/PagesEditor";

export const metadata = { title: "About & policies" };

export default async function AdminPages() {
  const pages = await getSettings("pages");
  return (
    <div>
      <PageHeader title="About & policies" description="Edit your About page and the shipping, returns, privacy and terms pages." />
      <PagesEditor initial={pages} />
    </div>
  );
}
