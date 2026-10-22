import Link from "next/link";
import { ArrowRight, CreditCard, Gift, Leaf, Phone, RefreshCw, ShieldCheck, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getProductCards } from "@/lib/catalog";
import { GENDER_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { textBlocks } from "@/lib/utils";
import type { HomepageSectionId } from "@/lib/settings-schema";
import HeroSlider from "@/components/store/HeroSlider";
import { ProductGrid } from "@/components/store/ProductCard";
import CountdownTimer from "@/components/store/CountdownTimer";
import NewsletterForm from "@/components/store/NewsletterForm";
import { SectionHeading, Stars } from "@/components/ui/Misc";

const SERVICE_ICON = { truck: Truck, refresh: RefreshCw, card: CreditCard, shield: ShieldCheck, gift: Gift, star: Star, phone: Phone, leaf: Leaf };

export default async function HomePage() {
  const home = await getSettings("homepage");
  const enabled = new Set(home.sections.filter((s) => s.enabled).map((s) => s.id));
  const want = (id: HomepageSectionId) => enabled.has(id);

  const [categories, newArrivals, bestSellers, flashSale, featured, trending, testimonials] = await Promise.all([
    want("categories") ? prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], take: 8 }) : [],
    want("new-arrivals") ? getProductCards({ isNewArrival: true }, { take: 8 }) : [],
    want("best-sellers") ? getProductCards({ isBestSeller: true }, { take: 8, orderBy: [{ salesCount: "desc" }] }) : [],
    want("flash-sale") ? getProductCards({ isFlashSale: true }, { take: 4 }) : [],
    want("featured") ? getProductCards({ isFeatured: true }, { take: 8 }) : [],
    want("trending") ? getProductCards({ isTrending: true }, { take: 8 }) : [],
    want("testimonials")
      ? prisma.review.findMany({
          where: { status: "APPROVED", rating: { gte: 4 } },
          orderBy: { createdAt: "desc" },
          take: 3,
          include: { user: { select: { name: true } }, product: { select: { title: true, slug: true } } },
        })
      : [],
  ]);

  const render = (id: HomepageSectionId) => {
    switch (id) {
      case "hero":
        return <HeroSlider key={id} banners={home.banners} />;

      case "services":
        if (!home.services.length) return null;
        return (
          <section key={id} className="container-page">
            <div className="grid grid-cols-2 gap-6 border-y border-luxury-200 py-8 dark:border-zinc-800 md:grid-cols-4">
              {home.services.map((s, i) => {
                const Icon = SERVICE_ICON[s.icon];
                return (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <Icon className="text-brand" size={24} aria-hidden />
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs text-luxury-500 dark:text-zinc-400">{s.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        );

      case "categories":
        if (!categories.length) return null;
        return (
          <section key={id} className="container-page">
            <SectionHeading eyebrow="Curated for you" title="Shop by Category" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {categories.map((c) => (
                <Link key={c.id} href={`/shop?category=${c.slug}`} className="group relative flex aspect-[4/5] items-end overflow-hidden bg-zinc-900">
                  {c.image && <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="relative p-5 text-white">
                    {c.gender && <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">{GENDER_LABELS[c.gender]}</p>}
                    <h3 className="font-serif text-xl">{c.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-300 group-hover:text-white">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );

      case "new-arrivals":
        return productSection(id, "Just dropped", "New Arrivals", newArrivals, "/shop?sort=newest");
      case "best-sellers":
        return productSection(id, "Customer favourites", "Best Sellers", bestSellers, "/shop?sort=popular");
      case "featured":
        return productSection(id, "Handpicked", "Featured", featured, "/shop");
      case "trending":
        return productSection(id, "What's hot", "Trending Now", trending, "/shop?sort=popular");

      case "promo":
        if (!home.promo.title) return null;
        return (
          <section key={id} className="relative overflow-hidden bg-zinc-950 py-20 text-white">
            {home.promo.image && <img src={home.promo.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            <div className="container-page relative max-w-7xl">
              <div className="max-w-xl space-y-5">
                {home.promo.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{home.promo.eyebrow}</p>}
                <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{home.promo.title}</h2>
                {home.promo.subtitle && <p className="text-zinc-300">{home.promo.subtitle}</p>}
                {home.promo.buttonText && home.promo.link && (
                  <Link href={home.promo.link} className="inline-flex h-12 items-center rounded-sm bg-white px-8 text-sm font-semibold text-zinc-950 hover:bg-brand hover:text-brand-fg">
                    {home.promo.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </section>
        );

      case "flash-sale": {
        const ended = home.flashSale.endsAt && new Date(home.flashSale.endsAt).getTime() < Date.now();
        if (!flashSale.length || ended) return null;
        return (
          <section key={id} className="container-page">
            <div className="grid gap-8 rounded-sm border border-luxury-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-10 lg:grid-cols-3">
              <div className="space-y-4">
                <span className="inline-block rounded-sm bg-red-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">{home.flashSale.badge || "Flash sale"}</span>
                <h2 className="font-serif text-3xl">{home.flashSale.title}</h2>
                <p className="text-sm text-luxury-600 dark:text-zinc-400">{home.flashSale.subtitle}</p>
                {home.flashSale.endsAt && <CountdownTimer endsAt={home.flashSale.endsAt} />}
                <Link href="/shop?sale=1" className="inline-flex items-center gap-1 text-sm font-semibold hover:text-brand">
                  Shop the sale <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
                {flashSale.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`} className="group">
                    <div className="aspect-[3/4] overflow-hidden bg-luxury-100 dark:bg-zinc-800">
                      {p.image && <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-medium">{p.title}</p>
                    <p className="text-sm">
                      <span className="font-semibold text-red-600">{formatINR(p.price)}</span>
                      {p.compareAtPrice && <span className="ml-2 text-xs text-luxury-400 line-through">{formatINR(p.compareAtPrice)}</span>}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "brand-story":
        if (!home.brandStory.title) return null;
        return (
          <section key={id} className="container-page">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {home.brandStory.image && (
                <div className="aspect-[4/5] overflow-hidden bg-luxury-100 sm:aspect-[4/3] lg:aspect-[4/5]">
                  <img src={home.brandStory.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="space-y-5">
                {home.brandStory.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{home.brandStory.eyebrow}</p>}
                <h2 className="font-serif text-3xl leading-snug sm:text-4xl">{home.brandStory.title}</h2>
                {textBlocks(home.brandStory.body).map((b, i) => (
                  <p key={i} className="leading-relaxed text-luxury-600 dark:text-zinc-400">{b.text}</p>
                ))}
                <Link href="/about" className="inline-flex items-center gap-2 border-b-2 border-luxury-900 pb-1 text-sm font-semibold hover:border-brand hover:text-brand dark:border-white">
                  Read our story <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        );

      case "testimonials":
        if (!testimonials.length) return null;
        return (
          <section key={id} className="container-page">
            <SectionHeading eyebrow="Loved by our customers" title="What People Say" />
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((r) => (
                <figure key={r.id} className="flex flex-col rounded-sm border border-luxury-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-luxury-700 dark:text-zinc-300">“{r.comment}”</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-semibold">{r.user.name.split(" ")[0]}</span>
                    <span className="text-luxury-500"> on </span>
                    <Link href={`/product/${r.product.slug}`} className="text-luxury-700 underline-offset-2 hover:underline dark:text-zinc-300">
                      {r.product.title}
                    </Link>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );

      case "newsletter":
        return (
          <section key={id} className="container-page">
            <div className="rounded-sm bg-zinc-950 px-6 py-16 text-center text-white">
              <div className="mx-auto max-w-xl space-y-4">
                <h2 className="font-serif text-3xl">{home.newsletter.title}</h2>
                <p className="text-sm text-zinc-400">{home.newsletter.description}</p>
                <div className="mx-auto max-w-md pt-2">
                  <NewsletterForm dark />
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-20 pb-4">
      {home.sections.filter((s) => s.enabled).map((s) => render(s.id))}
    </div>
  );
}

function productSection(id: string, eyebrow: string, title: string, products: Awaited<ReturnType<typeof getProductCards>>, href: string) {
  if (!products.length) return null;
  return (
    <section key={id} className="container-page">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
          <h2 className="mt-1 font-serif text-3xl sm:text-4xl">{title}</h2>
        </div>
        <Link href={href} className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold hover:text-brand">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
