import { prisma } from "@/lib/db";
import { getSettings, isPreviewRequest } from "@/lib/settings";
import { activeBanners } from "@/lib/homepage";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { StoreUIProvider } from "@/components/providers/StoreUIProvider";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import BackToTop from "@/components/store/BackToTop";
import WelcomePopup from "@/components/store/WelcomePopup";
import WhatsAppButton from "@/components/store/WhatsAppButton";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [store, theme, nav, home, engagement, preview, categories] = await Promise.all([
    getSettings("store"),
    getSettings("theme"),
    getSettings("navigation"),
    getSettings("homepage"),
    getSettings("engagement"),
    isPreviewRequest(),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true, gender: true, image: true },
    }),
  ]);
  // The header floats over the homepage hero only when the hero is the first visible section.
  const firstSection = home.sections.find((s) => s.enabled);
  const overlayOnHome = theme.header.transparentOnHero && firstSection?.id === "hero" && activeBanners(home.banners).length > 0;

  return (
    <StoreUIProvider value={{ card: theme.productCard }}>
      <CartProvider>
        <WishlistProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2">
            Skip to content
          </a>
          {preview && (
            <div className="fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-zinc-900/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
              Preview — unsaved changes
            </div>
          )}
          <Navbar
            logo={{ text: store.logoText, ...theme.logo }}
            links={nav.headerLinks}
            megaMenu={theme.header.megaMenu}
            allowThemeToggle={theme.allowThemeToggle}
            announcement={store.announcement.enabled && store.announcement.text ? store.announcement : null}
            categories={categories}
            overlayOnHome={overlayOnHome}
          />
          <main id="main" className="min-h-[60vh]">
            {children}
          </main>
          <Footer store={store} footer={nav.footer} logo={theme.logo} categories={categories.slice(0, 6)} />
          <CartDrawer codEnabled={store.payments.codEnabled} estimatedDelivery={store.shipping.estimatedDelivery} freeShippingBar={engagement.freeShippingBar} />
          <BackToTop />
          {engagement.whatsapp.enabled && store.whatsappNumber && <WhatsAppButton number={store.whatsappNumber} message={engagement.whatsapp.message} />}
          <WelcomePopup popup={engagement.popup} preview={preview} />
        </WishlistProvider>
      </CartProvider>
    </StoreUIProvider>
  );
}
