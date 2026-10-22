import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaffPage } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaffPage();
  const [store, theme, pendingOrders, pendingReviews, unreadMessages] = await Promise.all([
    getSettings("store"),
    getSettings("theme"),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING"] } } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      storeName={store.storeName}
      logoImage={theme.logo.image}
      badges={{ orders: pendingOrders, reviews: pendingReviews, messages: unreadMessages }}
    >
      {children}
    </AdminShell>
  );
}
