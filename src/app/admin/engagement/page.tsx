import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getLinkSuggestions, getPreviewPaths } from "@/lib/admin-links";
import { PageHeader } from "@/components/admin/ui";
import EngagementEditor from "@/components/admin/EngagementEditor";

export const metadata = { title: "Popups & chat" };

export default async function AdminEngagement() {
  const [engagement, store, coupons, { links }, paths] = await Promise.all([
    getSettings("engagement"),
    getSettings("store"),
    prisma.coupon.findMany({ where: { isActive: true }, select: { code: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    getLinkSuggestions(),
    getPreviewPaths(),
  ]);
  return (
    <div>
      <PageHeader title="Popups & chat" description="Welcome offer popup, WhatsApp chat button and the free-shipping bar in the shopping bag." />
      <EngagementEditor initial={engagement} whatsappNumber={store.whatsappNumber} coupons={coupons.map((c) => c.code)} suggestions={links} previewPaths={paths} />
    </div>
  );
}
