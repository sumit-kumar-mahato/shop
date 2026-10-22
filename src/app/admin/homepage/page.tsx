import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import HomepageEditor from "@/components/admin/HomepageEditor";

export const metadata = { title: "Homepage" };

export default async function AdminHomepage() {
  const home = await getSettings("homepage");
  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Choose which sections appear, their order, and what they say."
        actions={
          <Link href="/" target="_blank" className="inline-flex h-9 items-center gap-2 rounded-sm border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
            View homepage <ExternalLink size={14} />
          </Link>
        }
      />
      <HomepageEditor initial={home} />
    </div>
  );
}
