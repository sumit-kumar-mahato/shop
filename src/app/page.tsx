import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Star, RefreshCw, Truck, CreditCard, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import HeroSlider from "@/components/HeroSlider";
import CountdownTimer from "@/components/CountdownTimer";

// Helper to safely parse JSON strings
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default async function HomePage() {
  // 1. Fetch Store CMS Configurations
  let settings: any = {
    storeName: "PRABODH KUMAR MAHATO CLOTHING",
    banners: [] as any[],
    sectionsOrder: [] as string[],
    promoHighlight: {} as any,
  };

  try {
    const configRecord = await prisma.cmsConfig.findUnique({
      where: { key: "store_settings" },
    });
    if (configRecord) {
      settings = JSON.parse(configRecord.value);
    }
  } catch (e) {
    // Fallback if db is not setup yet
  }

  // 2. Fetch categories
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      take: 6,
    });
  } catch (e) {}

  // 3. Fetch products categories
  let featuredProducts: any[] = [];
  let trendingProducts: any[] = [];
  let bestSellers: any[] = [];
  let newArrivals: any[] = [];
  let flashSaleProducts: any[] = [];

  try {
    featuredProducts = await prisma.product.findMany({ where: { isFeatured: true }, take: 4 });
    trendingProducts = await prisma.product.findMany({ where: { isTrending: true }, take: 4 });
    bestSellers = await prisma.product.findMany({ where: { isBestSeller: true }, take: 4 });
    newArrivals = await prisma.product.findMany({ where: { isNewArrival: true }, orderBy: { createdAt: "desc" }, take: 4 });
    flashSaleProducts = await prisma.product.findMany({ where: { isFlashSale: true }, take: 4 });
  } catch (e) {}

  // If no products loaded yet (e.g. fresh database before seed), empty lists
  const defaultSectionsOrder = [
    "hero-slider",
    "services-bar",
    "featured-categories",
    "new-arrivals",
    "promo-highlights",
    "best-sellers",
    "flash-sale",
    "brand-story",
  ];

  const sectionsToRender = settings.sectionsOrder || defaultSectionsOrder;

  return (
    <div className="space-y-16 pb-12 overflow-hidden">
      {sectionsToRender.map((sectionId: string) => {
        switch (sectionId) {
          case "hero-slider":
            return (
              <section key={sectionId} className="w-full">
                <HeroSlider banners={settings.banners} />
              </section>
            );

          case "services-bar":
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-luxury-200/60 dark:border-zinc-800/60 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Truck className="text-luxury-gold" size={24} />
                    <span className="text-xs font-bold tracking-widest uppercase">{settings.service1Title || "Free Shipping"}</span>
                    <span className="text-[11px] text-luxury-500 font-light">{settings.service1Desc || "On all orders above ₹2000"}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="text-luxury-gold" size={22} />
                    <span className="text-xs font-bold tracking-widest uppercase">{settings.service2Title || "7 Days Returns"}</span>
                    <span className="text-[11px] text-luxury-500 font-light">{settings.service2Desc || "Easy return & exchange request"}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <CreditCard className="text-luxury-gold" size={24} />
                    <span className="text-xs font-bold tracking-widest uppercase">{settings.service3Title || "Secure Payments"}</span>
                    <span className="text-[11px] text-luxury-500 font-light">{settings.service3Desc || "Stripe, Razorpay, UPI & COD"}</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <ShieldCheck className="text-luxury-gold" size={24} />
                    <span className="text-xs font-bold tracking-widest uppercase">{settings.service4Title || "100% Genuine"}</span>
                    <span className="text-[11px] text-luxury-500 font-light">{settings.service4Desc || "Pure silks, linens & cottons"}</span>
                  </div>
                </div>
              </section>
            );

          case "featured-categories":
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                  <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">Curated Catalog</span>
                  <h2 className="serif-header text-3xl font-normal uppercase tracking-wide">Featured Categories</h2>
                  <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categories.slice(0, 4).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="group relative h-80 overflow-hidden flex flex-col justify-end p-6 bg-zinc-900 shadow-md"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80"
                        style={{ backgroundImage: `url(${cat.image})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="relative z-10 space-y-2 text-white">
                        <span className="text-[9px] tracking-wider font-bold text-luxury-gold uppercase">
                          {cat.gender}'S COLLECTION
                        </span>
                        <h3 className="display-header font-bold text-lg tracking-wide uppercase">
                          {cat.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-zinc-300 group-hover:text-luxury-gold transition-colors mt-1">
                          DISCOVER <ArrowRight size={10} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );

          case "new-arrivals":
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10 border-b border-luxury-200/40 dark:border-zinc-800/40 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">Just Dropped</span>
                    <h2 className="serif-header text-2xl sm:text-3xl font-normal uppercase tracking-wide">New Arrivals</h2>
                  </div>
                  <Link href="/shop" className="text-xs font-bold tracking-widest text-luxury-600 dark:text-zinc-400 hover:text-luxury-gold flex items-center gap-2">
                    VIEW ALL <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {newArrivals.map((product) => {
                    const productImages = safeParse(product.images);
                    return (
                      <div key={product.id} className="group relative flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md">
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
                          <Image
                            src={productImages[0] || "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {product.compareAtPrice && (
                            <span className="absolute top-2 left-2 bg-luxury-gold text-zinc-950 text-[10px] font-bold px-2 py-0.5 uppercase">
                              -{product.discountPercentage}%
                            </span>
                          )}
                          <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
                        </div>
                        <div className="flex flex-col space-y-1 flex-grow">
                          <span className="text-[10px] tracking-widest text-luxury-500 font-bold uppercase">{product.categoryName}</span>
                          <Link href={`/product/${product.id}`} className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1">
                            {product.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-luxury-900 dark:text-white">₹{product.price}</span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-luxury-400 dark:text-zinc-500 line-through">₹{product.compareAtPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case "promo-highlights":
            if (!settings.promoHighlight || !settings.promoHighlight.title) return null;
            return (
              <section key={sectionId} className="w-full bg-zinc-900 text-white py-16 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{ backgroundImage: `url(${settings.promoHighlight.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="max-w-xl space-y-6">
                    <span className="text-xs font-bold tracking-widest text-luxury-gold uppercase border-b border-luxury-gold/50 pb-1">
                      LIMITED TIME OFFERS
                    </span>
                    <h2 className="serif-header text-3xl sm:text-5xl font-normal leading-tight uppercase">
                      {settings.promoHighlight.title}
                    </h2>
                    <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
                      {settings.promoHighlight.subtitle}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={settings.promoHighlight.link}
                        className="inline-block bg-white text-zinc-950 hover:bg-luxury-gold hover:text-zinc-950 text-xs font-bold tracking-widest px-8 py-3.5 rounded-sm transition-all duration-300 active:scale-95"
                      >
                        {settings.promoHighlight.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "best-sellers":
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">Best Sellers</span>
                  <h2 className="serif-header text-3xl font-normal uppercase tracking-wide">Client Favorites</h2>
                  <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {bestSellers.map((product) => {
                    const productImages = safeParse(product.images);
                    return (
                      <div key={product.id} className="group relative flex flex-col space-y-3 bg-white dark:bg-zinc-900 border border-luxury-200/20 dark:border-zinc-800/40 p-3 rounded-sm shadow-sm transition-all hover:shadow-md">
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950">
                          <Image
                            src={productImages[0] || "/placeholder.jpg"}
                            alt={product.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
                        </div>
                        <div className="flex flex-col space-y-1 flex-grow">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] tracking-widest text-luxury-500 font-bold uppercase">{product.categoryName}</span>
                            <div className="flex items-center text-[11px] text-amber-500 font-bold">
                              <Star size={11} fill="currentColor" className="mr-0.5" />
                              <span>{product.rating}</span>
                            </div>
                          </div>
                          <Link href={`/product/${product.id}`} className="font-semibold text-sm hover:text-luxury-gold transition-colors line-clamp-1">
                            {product.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-luxury-900 dark:text-white">₹{product.price}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case "flash-sale":
            if (flashSaleProducts.length === 0) return null;
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-luxury-100 dark:bg-zinc-900 border border-luxury-200/50 dark:border-zinc-800 p-8 flex flex-col md:flex-row items-center justify-between gap-8 rounded-sm">
                  <div className="space-y-4">
                    <span className="inline-block bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 uppercase rounded tracking-wider animate-pulse">
                      FLASH SALE RUNNING
                    </span>
                    <h3 className="serif-header text-2xl sm:text-3xl font-normal uppercase tracking-wide">
                      Mid-Season Clearance
                    </h3>
                    <p className="text-xs sm:text-sm text-luxury-500 font-light max-w-md">
                      Get premium Supima cotton tees, raw denim, and linen suits at limited-time discount rates. Free delivery applies.
                    </p>
                    <CountdownTimer />
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    {flashSaleProducts.slice(0, 2).map((product) => {
                      const imgs = safeParse(product.images);
                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-3 border border-luxury-200/20 dark:border-zinc-800 rounded shadow-sm hover:border-luxury-gold/50 transition-colors"
                        >
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image src={imgs[0]} alt={product.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs truncate w-32">{product.title}</h4>
                            <p className="text-[10px] text-red-500 font-bold mt-1">₹{product.price}</p>
                            <p className="text-[9px] text-zinc-400 line-through">₹{product.compareAtPrice}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "brand-story":
            return (
              <section key={sectionId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="relative h-[30rem] w-full overflow-hidden bg-luxury-100 shadow-md">
                    <Image
                      src={settings.brandStoryImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"}
                      alt="Brand Craftsmanship"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-6 lg:pl-6">
                    <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase border-b-2 border-luxury-gold pb-1 inline-block">
                      OUR PHILOSOPHY
                    </span>
                    <h2 className="serif-header text-3xl sm:text-4xl font-normal uppercase tracking-wide leading-snug">
                      {settings.brandStoryTitle || "Weaving Heritage with Modern Geometries"}
                    </h2>
                    <p className="text-sm text-luxury-600 dark:text-zinc-400 font-light leading-relaxed">
                      {settings.brandStoryDesc1 || "Founded with a dedication to premium materials and traditional textile crafts, our boutique focuses on longevity, sustainability, and absolute visual elegance. Each fabric is hand-selected from weavers across Banaras and international mills to ensure unmatched softness, stitch structure, and color richness."}
                    </p>
                    <p className="text-sm text-luxury-600 dark:text-zinc-400 font-light leading-relaxed">
                      {settings.brandStoryDesc2 || "We reject fast fashion cycles. Our designs are engineered to reside in your closet for years, offering comfortable fits, premium textures, and structural resistance that respects the environment and the heritage artisans who woven them."}
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/about"
                        className="inline-flex items-center gap-2 border-b-2 border-luxury-900 dark:border-white pb-1.5 text-xs font-bold tracking-widest hover:text-luxury-gold hover:border-luxury-gold transition-all"
                      >
                        READ OUR FULL STORY <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* 9. Newsletter Section (Always visible) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-zinc-950 text-white py-16 rounded-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-luxury-800/40 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">THE {settings.storeName || "PRABODH KUMAR MAHATO"} SOCIETY</span>
          <h2 className="serif-header text-3xl font-normal uppercase tracking-wide">{settings.newsletterTitle || "Unlock Exclusive Previews"}</h2>
          <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
            {settings.newsletterDesc || "Subscribe to our private list and receive early alerts on capsule collections, runway launches, and private members-only seasonal promotions."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-zinc-900 border border-zinc-800 text-sm px-4 py-3 sm:w-80 text-white placeholder-zinc-500 focus:outline-none focus:border-luxury-gold"
            />
            <button className="bg-white hover:bg-luxury-gold text-zinc-950 hover:text-zinc-950 transition-colors font-bold text-xs tracking-widest py-3 px-6 uppercase rounded-sm active:scale-95">
              JOIN SOCIETY
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
