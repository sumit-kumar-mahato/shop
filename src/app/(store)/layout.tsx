import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import BackToTop from "@/components/store/BackToTop";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [store, categories] = await Promise.all([
    getSettings("store"),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true, gender: true },
    }),
  ]);

  return (
    <CartProvider>
      <WishlistProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Navbar
          logoText={store.logoText}
          announcement={store.announcement.enabled && store.announcement.text ? store.announcement : null}
          categories={categories}
        />
        <main id="main" className="min-h-[60vh]">
          {children}
        </main>
        <Footer store={store} categories={categories.slice(0, 6)} />
        <CartDrawer
          codEnabled={store.payments.codEnabled}
          estimatedDelivery={store.shipping.estimatedDelivery}
        />
        <BackToTop />
      </WishlistProvider>
    </CartProvider>
  );
}
