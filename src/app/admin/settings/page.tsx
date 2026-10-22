import { requireStaffPage } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { razorpayEnabled } from "@/lib/payments/razorpay";
import { env } from "@/lib/env";
import { PageHeader } from "@/components/admin/ui";
import StoreSettingsEditor from "@/components/admin/StoreSettingsEditor";

export const metadata = { title: "Store settings" };

export default async function AdminSettings() {
  await requireStaffPage({ adminOnly: true });
  const store = await getSettings("store");
  return (
    <div>
      <PageHeader title="Store settings" description="Branding, contact details, shipping, tax, payments and checkout rules." />
      <StoreSettingsEditor initial={store} integrations={{ razorpay: razorpayEnabled(), email: Boolean(env.smtp.host) }} />
    </div>
  );
}
