import "server-only";
import { prisma, table } from "@/lib/db";
import { env } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import { defaultPagesSettings, defaultStoreSettings } from "@/lib/settings-schema";

export type ChecklistItem = { done: boolean; title: string; detail: string; href?: string };

/** Things the owner should finish before (and shortly after) going live. */
export async function getLaunchChecklist(): Promise<ChecklistItem[]> {
  const [store, pages, demoRows] = await Promise.all([
    getSettings("store"),
    getSettings("pages"),
    prisma.$queryRaw<Array<{ n: bigint }>>`
      SELECT COUNT(*) AS n FROM ${table("Product")}
      WHERE "status"::text = 'ACTIVE' AND array_to_string("images", ' ') LIKE '%images.unsplash.com%'`,
  ]);
  const demoProducts = Number(demoRows[0]?.n ?? 0);
  const policiesEdited = (Object.keys(defaultPagesSettings.policies) as Array<keyof typeof pages.policies>).every(
    (k) => pages.policies[k] !== defaultPagesSettings.policies[k],
  );
  const contactDone =
    !store.contactEmail.endsWith("@example.com") &&
    store.contactPhone !== defaultStoreSettings.contactPhone &&
    store.address !== defaultStoreSettings.address;

  return [
    {
      done: contactDone,
      title: "Add your real contact details",
      detail: "Email, phone number and shop address appear in the footer, invoices and emails. Razorpay checks these before approving live payments.",
      href: "/admin/settings",
    },
    {
      done: policiesEdited && pages.about.body !== defaultPagesSettings.about.body,
      title: "Review About, shipping, returns, privacy & terms pages",
      detail: "They currently contain sample text. Razorpay requires accurate refund/cancellation and shipping policies.",
      href: "/admin/pages",
    },
    {
      done: demoProducts === 0,
      title: "Replace the demo products",
      detail: demoProducts ? `${demoProducts} product(s) still use sample stock photos. Edit them with your own photos, or archive them.` : "Done.",
      href: "/admin/products",
    },
    {
      done: Boolean(env.smtp.host),
      title: "Set up email sending (SMTP)",
      detail: "Without it, customers don't receive order confirmations or password-reset links. Add SMTP_* variables (e.g. Brevo free plan or a Gmail app password).",
    },
    {
      done: env.razorpay.configured && env.razorpay.keyId.startsWith("rzp_live_"),
      title: env.razorpay.configured ? "Switch Razorpay to live keys" : "Connect Razorpay for online payments",
      detail: env.razorpay.configured
        ? "Test keys are in use, so no real money is collected. After Razorpay activates your account, replace them with rzp_live_ keys."
        : "Only Cash on Delivery is available until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.",
    },
    {
      done: env.razorpay.webhookSecret.length >= 24,
      title: "Use a long random Razorpay webhook secret",
      detail: "The webhook secret must be hard to guess (24+ random characters). Set the same value in Razorpay → Webhooks and RAZORPAY_WEBHOOK_SECRET.",
    },
    {
      done: !env.isProd || /^https:\/\//.test(env.appUrl),
      title: "Set APP_URL to your website address",
      detail: "Links in emails and the sitemap use APP_URL. It must be your https:// address.",
    },
    {
      done: Boolean(store.seo.googleVerification),
      title: "Register your store with Google",
      detail: `In Google Search Console add the property ${env.appUrl}, choose “HTML tag”, paste the code under Store settings → Search engines, press Verify, then submit ${env.appUrl}/sitemap.xml.`,
      href: "/admin/settings",
    },
  ];
}
