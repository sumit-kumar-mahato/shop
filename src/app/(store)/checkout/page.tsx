import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { razorpayEnabled } from "@/lib/payments/razorpay";
import CheckoutClient from "@/components/store/CheckoutClient";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await requireUserPage("/checkout");
  const [addresses, store, theme] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    getSettings("store"),
    getSettings("theme"),
  ]);

  return (
    <CheckoutClient
      initialAddresses={addresses.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() }))}
      user={{ name: user.name, email: user.email, phone: user.phone, emailVerified: user.emailVerified }}
      payments={{
        cod: store.payments.codEnabled,
        codMax: store.payments.codMaxOrderValue,
        online: store.payments.onlineEnabled && razorpayEnabled(),
      }}
      requireVerification={store.orders.requireEmailVerification}
      storeName={store.storeName}
      brandColor={theme.primaryColor}
      taxRate={store.tax.ratePercent}
    />
  );
}
