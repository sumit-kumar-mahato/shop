import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getProductCards } from "@/lib/catalog";
import { env } from "@/lib/env";
import { activeBanners } from "@/lib/homepage";
import { GENDER_LABELS } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { cn, textBlocks } from "@/lib/utils";
import { isBuiltInSection, type BlockOf, type HomepageBlock, type HomepageSectionId } from "@/lib/settings-schema";
import type { ProductCardData } from "@/lib/types";
import HeroSlider from "@/components/store/HeroSlider";
import ProductRail from "@/components/store/ProductRail";
import CountdownTimer from "@/components/store/CountdownTimer";
import NewsletterForm from "@/components/store/NewsletterForm";
import {
  BannerBlock,
  CategoriesBlock,
  FaqBlock,
  GalleryBlock,
  ImageTextBlock,
  MarqueeBlock,
  ProductsBlock,
  SectionHead,
  TextBlock,
  VideoBlock,
} from "@/components/store/home/HomeBlocks";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import SmartImage from "@/components/ui/SmartImage";
import ParallaxImage from "@/components/ui/ParallaxImage";
import Icon from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Misc";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Structured data that helps Google show the shop's name, logo, contact details and a search box. */
async function storeJsonLd() {
  const [store, theme] = await Promise.all([getSettings("store"), getSettings("theme")]);
  const url = env.appUrl;
  const logo = theme.logo.image ? new URL(theme.logo.image, url).toString() : undefined;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: store.storeName,
      url,
      potentialAction: { "@type": "SearchAction", target: `${url}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
    {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      name: store.storeName,
      url,
      ...(logo ? { logo, image: logo } : {}),
      description: store.seo.description || store.tagline,
      email: store.contactEmail,
      ...(store.contactPhone ? { telephone: store.contactPhone } : {}),
      ...(store.address ? { address: { "@type": "PostalAddress", streetAddress: store.address, addressCountry: "IN" } } : {}),
      // Only real profile links (not a bare https://instagram.com placeholder).
      sameAs: Object.values(store.social).filter((s) => /^https:\/\/[^/]+\/[^/]+/.test(s)),
    },
  ];
}

/** Products for a "Product collection" block. */
function loadBlockProducts(block: BlockOf<"products">): Promise<ProductCardData[]> {
  const take = block.limit;
  const where: Record<BlockOf<"products">["source"], Prisma.ProductWhereInput> = {
    new: { isNewArrival: true },
    best: { isBestSeller: true },
    featured: { isFeatured: true },
    trending: { isTrending: true },
    flash: { isFlashSale: true },
    sale: { compareAtPrice: { not: null } },
    newest: {},
    category: { category: { slug: block.category } },
    gender: { gender: block.gender },
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] | undefined = block.source === "best" ? [{ salesCount: "desc" }] : undefined;
  return getProductCards(where[block.source], { take, orderBy });
}

export default async function HomePage() {
  const home = await getSettings("homepage");
  const blocks = new Map(home.blocks.map((b) => [b.id, b]));
  // Keep only sections that exist (a block may have been deleted while its entry remained).
  const enabled = home.sections.filter((s) => s.enabled && (isBuiltInSection(s.id) || blocks.has(s.id)));
  const want = (id: HomepageSectionId) => enabled.some((s) => s.id === id);
  const banners = activeBanners(home.banners);
  const enabledBlocks = enabled.map((s) => blocks.get(s.id)).filter((b): b is HomepageBlock => Boolean(b));
  const needCategories = want("categories") || enabledBlocks.some((b) => b.type === "categories");
  const productBlocks = enabledBlocks.filter((b): b is BlockOf<"products"> => b.type === "products");
  const heroFirst = enabled[0]?.id === "hero" && banners.length > 0;

  const [categories, newArrivals, bestSellers, flashSale, featured, trending, testimonials, blockProducts] = await Promise.all([
    needCategories ? prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }) : [],
    want("new-arrivals") ? getProductCards({ isNewArrival: true }, { take: 10 }) : [],
    want("best-sellers") ? getProductCards({ isBestSeller: true }, { take: 10, orderBy: [{ salesCount: "desc" }] }) : [],
    want("flash-sale") ? getProductCards({ isFlashSale: true }, { take: 4 }) : [],
    want("featured") ? getProductCards({ isFeatured: true }, { take: 10 }) : [],
    want("trending") ? getProductCards({ isTrending: true }, { take: 10 }) : [],
    want("testimonials")
      ? prisma.review.findMany({
          where: { status: "APPROVED", rating: { gte: 4 } },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { name: true } }, product: { select: { title: true, slug: true } } },
        })
      : [],
    Promise.all(productBlocks.map(async (b) => [b.id, await loadBlockProducts(b)] as const)).then((e) => new Map(e)),
  ]);
  const text = home.sectionText;
  const jsonLd = await storeJsonLd();

  const renderBlock = (block: HomepageBlock) => {
    switch (block.type) {
      case "products":
        return <ProductsBlock key={block.id} block={block} products={blockProducts.get(block.id) ?? []} />;
      case "banner":
        return <BannerBlock key={block.id} block={block} />;
      case "image-text":
        return <ImageTextBlock key={block.id} block={block} />;
      case "categories":
        return <CategoriesBlock key={block.id} block={block} categories={categories} />;
      case "gallery":
        return <GalleryBlock key={block.id} block={block} />;
      case "marquee":
        return <MarqueeBlock key={block.id} block={block} />;
      case "video":
        return <VideoBlock key={block.id} block={block} />;
      case "text":
        return <TextBlock key={block.id} block={block} />;
      case "faq":
        return <FaqBlock key={block.id} block={block} />;
    }
  };

  const render = (id: string, index: number) => {
    const block = blocks.get(id);
    if (block) return renderBlock(block);
    switch (id as HomepageSectionId) {
      case "hero":
        return (
          <HeroSlider
            key={id}
            banners={banners}
            height={index === 0 ? home.hero.height : home.hero.height === "full" ? "large" : home.hero.height}
            underHeader={index === 0}
            intervalSeconds={home.hero.autoplaySeconds}
            kenBurns={home.hero.kenBurns}
          />
        );

      case "services":
        if (!home.services.length) return null;
        return (
          <section
            key={id}
            className={cn("border-y border-luxury-200 bg-white py-5 dark:border-zinc-800 dark:bg-zinc-950", enabled[index - 1]?.id === "hero" && "!mt-0 border-t-0")}
            aria-label="Why shop with us"
          >
            <Marquee duration={36} className="mask-fade-x">
              {[...home.services, ...home.services].map((s, i) => (
                <div key={i} className="flex items-center gap-3 px-10">
                  <Icon name={s.icon} className="text-brand" size={20} />
                  <span className="whitespace-nowrap text-sm font-semibold uppercase tracking-[0.18em]">{s.title}</span>
                  <span className="whitespace-nowrap text-sm text-luxury-500 dark:text-zinc-400">{s.description}</span>
                  <span className="ml-10 text-brand" aria-hidden>✦</span>
                </div>
              ))}
            </Marquee>
          </section>
        );

      case "categories": {
        if (!categories.length) return null;
        const mosaic = categories.slice(0, 5);
        const rest = categories.slice(5, 12);
        return (
          <section key={id} className="container-page">
            <SectionHead eyebrow={text.categories.eyebrow} title={text.categories.title} href="/shop" linkText="All products" />
            <div className="grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] sm:gap-4 lg:grid-cols-4">
              {mosaic.map((c, i) => (
                <Reveal key={c.id} delay={i * 90} className={cn(i === 0 && "col-span-2 row-span-2")}>
                  <Link href={`/shop?category=${c.slug}`} className="group relative block h-full overflow-hidden rounded-sm bg-zinc-900">
                    <SmartImage src={c.image} alt="" className="absolute inset-0" imgClassName="transition-transform duration-[1.4s] ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white sm:p-7">
                      <div>
                        {c.gender && <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">{GENDER_LABELS[c.gender]}</p>}
                        <h3 className={cn("font-serif leading-tight", i === 0 ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl")}>{c.name}</h3>
                      </div>
                      <span className="flex h-11 w-11 flex-shrink-0 translate-y-2 items-center justify-center rounded-full bg-white text-zinc-950 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight size={18} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            {rest.length > 0 && (
              <Reveal className="mt-6 flex flex-wrap gap-2">
                {rest.map((c) => (
                  <Link key={c.id} href={`/shop?category=${c.slug}`} className="rounded-full border border-luxury-300 px-4 py-2 text-sm transition-colors hover:border-luxury-900 hover:bg-luxury-900 hover:text-white dark:border-zinc-700 dark:hover:bg-white dark:hover:text-zinc-900">
                    {c.name}
                  </Link>
                ))}
              </Reveal>
            )}
          </section>
        );
      }

      case "new-arrivals":
        return <Reveal key={id}><ProductRail eyebrow={text["new-arrivals"].eyebrow} title={text["new-arrivals"].title} products={newArrivals} href="/shop?sort=newest" /></Reveal>;
      case "best-sellers":
        return <Reveal key={id}><ProductRail eyebrow={text["best-sellers"].eyebrow} title={text["best-sellers"].title} products={bestSellers} href="/shop?sort=popular" /></Reveal>;
      case "featured":
        return <Reveal key={id}><ProductRail eyebrow={text.featured.eyebrow} title={text.featured.title} products={featured} href="/shop" /></Reveal>;
      case "trending":
        return <Reveal key={id}><ProductRail eyebrow={text.trending.eyebrow} title={text.trending.title} products={trending} href="/shop?sort=popular" /></Reveal>;

      case "promo":
        if (!home.promo.title) return null;
        return (
          <section key={id} className="relative flex min-h-[560px] items-center overflow-hidden bg-zinc-950 py-24 text-white">
            {home.promo.image && <ParallaxImage src={home.promo.image} className="opacity-60" />}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="container-page relative">
              <Reveal className="max-w-2xl">
                {home.promo.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">{home.promo.eyebrow}</p>}
                <h2 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-7xl">{home.promo.title}</h2>
                {home.promo.subtitle && <p className="mt-6 max-w-lg text-lg text-white/80">{home.promo.subtitle}</p>}
                {home.promo.buttonText && home.promo.link && (
                  <Link href={home.promo.link} className="group mt-10 inline-flex h-12 items-center gap-2 rounded-btn bg-white px-8 text-sm font-semibold text-zinc-950 transition-colors hover:bg-brand hover:text-brand-fg">
                    {home.promo.buttonText} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </Reveal>
            </div>
          </section>
        );

      case "flash-sale": {
        const ended = home.flashSale.endsAt && new Date(home.flashSale.endsAt).getTime() < Date.now();
        if (!flashSale.length || ended) return null;
        return (
          <section key={id} className="container-page">
            <Reveal className="overflow-hidden rounded-sm bg-luxury-900 text-white dark:bg-zinc-900">
              <div className="grid lg:grid-cols-[1fr_1.6fr]">
                <div className="relative flex flex-col justify-center gap-5 p-8 sm:p-12">
                  <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" aria-hidden />
                  <span className="relative inline-flex w-fit items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> {home.flashSale.badge || "Flash sale"}
                  </span>
                  <h2 className="relative font-serif text-4xl sm:text-5xl">{home.flashSale.title}</h2>
                  <p className="relative text-white/70">{home.flashSale.subtitle}</p>
                  {home.flashSale.endsAt && <CountdownTimer endsAt={home.flashSale.endsAt} />}
                  {home.flashSale.buttonText && home.flashSale.link && (
                    <Link href={home.flashSale.link} className="group relative mt-2 inline-flex w-fit items-center gap-2 text-sm font-semibold">
                      {home.flashSale.buttonText} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
                  {flashSale.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} className="group bg-luxury-900 p-4 dark:bg-zinc-900">
                      <SmartImage src={p.image} alt={p.title} className="aspect-[3/4]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                      <p className="mt-3 line-clamp-1 text-sm">{p.title}</p>
                      <p className="text-sm">
                        <span className="font-semibold text-brand">{formatINR(p.price)}</span>
                        {p.compareAtPrice && <span className="ml-2 text-xs text-white/50 line-through">{formatINR(p.compareAtPrice)}</span>}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </section>
        );
      }

      case "brand-story":
        if (!home.brandStory.title) return null;
        return (
          <section key={id} className="container-page">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
              {home.brandStory.image && (
                <Reveal className="relative">
                  <div className="absolute -bottom-5 -right-5 hidden h-full w-full border border-brand/60 lg:block" aria-hidden />
                  <SmartImage src={home.brandStory.image} alt="" className="relative aspect-[4/5]" />
                  {home.brandStory.badgeTitle && (
                    <div className="absolute -left-4 bottom-10 hidden rounded-sm bg-white px-6 py-5 shadow-2xl dark:bg-zinc-900 sm:block">
                      <p className="font-serif text-3xl">{home.brandStory.badgeTitle}</p>
                      {home.brandStory.badgeText && <p className="text-xs uppercase tracking-[0.2em] text-luxury-500">{home.brandStory.badgeText}</p>}
                    </div>
                  )}
                </Reveal>
              )}
              <Reveal delay={120} className="space-y-6">
                {home.brandStory.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{home.brandStory.eyebrow}</p>}
                <h2 className="font-serif text-4xl leading-tight sm:text-6xl">{home.brandStory.title}</h2>
                {textBlocks(home.brandStory.body).map((b, i) => (
                  <p key={i} className="text-lg leading-relaxed text-luxury-600 dark:text-zinc-400">{b.text}</p>
                ))}
                {home.brandStory.buttonText && home.brandStory.link && (
                  <Link href={home.brandStory.link} className="group inline-flex items-center gap-3 pt-2 text-sm font-semibold uppercase tracking-[0.15em]">
                    <span className="h-px w-10 bg-current transition-all group-hover:w-16" /> {home.brandStory.buttonText}
                  </Link>
                )}
              </Reveal>
            </div>
          </section>
        );

      case "testimonials":
        if (!testimonials.length) return null;
        return (
          <section key={id} className="overflow-hidden bg-luxury-100/70 py-20 dark:bg-zinc-900/50">
            <div className="container-page">
              <SectionHead eyebrow={text.testimonials.eyebrow} title={text.testimonials.title} align="center" className="mb-12" />
            </div>
            <Marquee duration={Math.max(30, testimonials.length * 9)} className="mask-fade-x">
              {(testimonials.length < 4 ? [...testimonials, ...testimonials] : testimonials).map((r, i) => (
                <figure key={`${r.id}-${i}`} className="mx-3 flex w-[340px] flex-shrink-0 flex-col rounded-sm bg-white p-7 shadow-sm dark:bg-zinc-950 sm:w-[400px]">
                  <Quote className="text-brand" size={28} aria-hidden />
                  <blockquote className="mt-4 line-clamp-4 flex-1 font-serif text-lg leading-relaxed">“{r.comment}”</blockquote>
                  <figcaption className="mt-6 flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-semibold">{r.user.name.split(" ")[0]}</span>
                      <span className="block text-xs text-luxury-500">{r.product.title}</span>
                    </span>
                    <Stars rating={r.rating} size={13} />
                  </figcaption>
                </figure>
              ))}
            </Marquee>
          </section>
        );

      case "newsletter":
        return (
          <section key={id} className="container-page">
            <Reveal className="relative overflow-hidden rounded-sm bg-zinc-950 px-6 py-20 text-center text-white sm:px-12">
              <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand/25 blur-3xl" aria-hidden />
              <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-brand/15 blur-3xl" aria-hidden />
              <div className="relative mx-auto max-w-xl space-y-5">
                {home.newsletter.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{home.newsletter.eyebrow}</p>}
                <h2 className="font-serif text-4xl sm:text-5xl">{home.newsletter.title}</h2>
                <p className="text-white/70">{home.newsletter.description}</p>
                <div className="mx-auto max-w-md pt-3">
                  <NewsletterForm dark />
                </div>
              </div>
            </Reveal>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className={cn("space-y-24 pb-8 sm:space-y-32", !heroFirst && "pt-10")}>
        {enabled.map((s, i) => render(s.id, i))}
      </div>
    </>
  );
}
