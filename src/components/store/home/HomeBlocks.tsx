// Renderers for the reusable homepage blocks the admin adds in Admin → Homepage.
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import type { BlockOf } from "@/lib/settings-schema";
import type { ProductCardData } from "@/lib/types";
import { youtubeId } from "@/lib/homepage";
import { cn, textBlocks } from "@/lib/utils";
import ProductRail from "@/components/store/ProductRail";
import { ProductGrid } from "@/components/store/ProductCard";
import Reveal from "@/components/ui/Reveal";
import Marquee from "@/components/ui/Marquee";
import SmartImage from "@/components/ui/SmartImage";
import ParallaxImage from "@/components/ui/ParallaxImage";
import VideoEmbed from "./VideoEmbed";

type NavCategory = { name: string; slug: string; image: string | null };

export function SectionHead({
  eyebrow,
  title,
  subtitle,
  href,
  linkText = "View all",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
  align?: "left" | "center";
  className?: string;
}) {
  if (!eyebrow && !title) return null;
  return (
    <Reveal className={cn("mb-10 flex flex-wrap items-end gap-4", align === "center" ? "flex-col items-center text-center" : "justify-between", className)}>
      <div className={cn(align === "center" && "max-w-2xl")}>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{eyebrow}</p>}
        {title && <h2 className="mt-2 font-serif text-4xl sm:text-5xl">{title}</h2>}
        {subtitle && <p className="mt-4 text-luxury-600 dark:text-zinc-400">{subtitle}</p>}
      </div>
      {href && linkText && (
        <Link href={href} className="group flex items-center gap-1 text-sm font-semibold">
          {linkText} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </Reveal>
  );
}

function CTA({ text, href, tone = "dark", className }: { text: string; href: string; tone?: "dark" | "light"; className?: string }) {
  if (!text || !href) return null;
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center gap-2 rounded-btn px-8 text-sm font-semibold transition-colors",
        tone === "light" ? "bg-white text-zinc-950 hover:bg-brand hover:text-brand-fg" : "bg-luxury-900 text-white hover:bg-brand hover:text-brand-fg dark:bg-white dark:text-zinc-950",
        className,
      )}
    >
      {text} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

function Paragraphs({ body, className }: { body: string; className?: string }) {
  return (
    <>
      {textBlocks(body).map((b, i) =>
        b.type === "h" ? (
          <h3 key={i} className="pt-2 font-serif text-2xl">{b.text}</h3>
        ) : (
          <p key={i} className={cn("whitespace-pre-line leading-relaxed", className)}>{b.text}</p>
        ),
      )}
    </>
  );
}

export function ProductsBlock({ block, products }: { block: BlockOf<"products">; products: ProductCardData[] }) {
  if (!products.length) return null;
  if (block.layout === "rail") {
    return (
      <Reveal>
        <ProductRail eyebrow={block.eyebrow} title={block.title} products={products} href={block.link || "/shop"} />
      </Reveal>
    );
  }
  return (
    <section className="container-page">
      <SectionHead eyebrow={block.eyebrow} title={block.title} href={block.link} linkText={block.buttonText} />
      <ProductGrid products={products} />
    </section>
  );
}

const BANNER_HEIGHT = { medium: "min-h-[420px] py-20", large: "min-h-[600px] py-24", full: "min-h-[100svh] py-24" };

export function BannerBlock({ block }: { block: BlockOf<"banner"> }) {
  const a = block.overlay / 100;
  return (
    <section className={cn("relative flex items-center overflow-hidden bg-zinc-950 text-white", BANNER_HEIGHT[block.height])}>
      {block.parallax ? (
        <ParallaxImage src={block.image} mobileSrc={block.mobileImage} />
      ) : (
        <picture>
          {block.mobileImage && <source media="(max-width: 767px)" srcSet={block.mobileImage} />}
          <img src={block.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
      )}
      <div className="absolute inset-0" style={{ background: `rgb(0 0 0 / ${a})` }} />
      <div className={cn("container-page relative flex", block.align === "center" ? "justify-center text-center" : block.align === "right" ? "justify-end text-right" : "")}>
        <Reveal className="max-w-2xl">
          {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand">{block.eyebrow}</p>}
          {block.title && <h2 className="mt-4 font-serif text-5xl leading-[1.05] sm:text-7xl">{block.title}</h2>}
          {block.subtitle && <p className={cn("mt-6 max-w-lg text-lg text-white/80", block.align === "center" && "mx-auto", block.align === "right" && "ml-auto")}>{block.subtitle}</p>}
          <CTA text={block.buttonText} href={block.link} tone="light" className="mt-10" />
        </Reveal>
      </div>
    </section>
  );
}

export function ImageTextBlock({ block }: { block: BlockOf<"image-text"> }) {
  const dark = block.background === "dark";
  const inner = (
    <div className={cn("container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-20")}>
      {block.image && (
        <Reveal className={cn("relative", block.imageSide === "right" && "lg:order-2")}>
          <SmartImage src={block.image} alt="" className="aspect-[4/5] rounded-sm" />
        </Reveal>
      )}
      <Reveal delay={120} className={cn("space-y-6", !block.image && "lg:col-span-2 lg:mx-auto lg:max-w-2xl")}>
        {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{block.eyebrow}</p>}
        {block.title && <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{block.title}</h2>}
        <div className={cn("space-y-4 text-lg", dark ? "text-white/75" : "text-luxury-600 dark:text-zinc-400")}>
          <Paragraphs body={block.body} />
        </div>
        <CTA text={block.buttonText} href={block.link} tone={dark ? "light" : "dark"} className="mt-2" />
      </Reveal>
    </div>
  );
  if (block.background === "plain") return <section>{inner}</section>;
  return <section className={cn("py-20 sm:py-28", dark ? "bg-zinc-950 text-white" : "bg-luxury-100/70 dark:bg-zinc-900/50")}>{inner}</section>;
}

export function CategoriesBlock({ block, categories }: { block: BlockOf<"categories">; categories: NavCategory[] }) {
  const list = block.slugs.length ? block.slugs.map((s) => categories.find((c) => c.slug === s)).filter((c): c is NavCategory => Boolean(c)) : categories.slice(0, 8);
  if (!list.length) return null;

  if (block.style === "circles") {
    return (
      <section className="container-page">
        <SectionHead eyebrow={block.eyebrow} title={block.title} align="center" />
        <div className="no-scrollbar -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:justify-center sm:gap-8">
          {list.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60} className="snap-start">
              <Link href={`/shop?category=${c.slug}`} className="group flex w-24 flex-col items-center gap-3 sm:w-32">
                <span className="relative block aspect-square w-full overflow-hidden rounded-full ring-1 ring-luxury-200 ring-offset-4 ring-offset-luxury-50 transition-all duration-500 group-hover:ring-2 group-hover:ring-brand dark:ring-zinc-700 dark:ring-offset-zinc-950">
                  <SmartImage src={c.image} alt="" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-110" />
                </span>
                <span className="text-center text-sm font-medium">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="container-page">
      <SectionHead eyebrow={block.eyebrow} title={block.title} href="/shop" linkText="All products" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {list.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 4) * 80}>
            <Link href={`/shop?category=${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-zinc-900">
              <SmartImage src={c.image} alt="" className="absolute inset-0" imgClassName="transition-transform duration-[1.4s] ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white sm:p-5">
                <h3 className="font-serif text-xl sm:text-2xl">{c.name}</h3>
                <ArrowUpRight size={18} className="opacity-0 transition-all duration-500 group-hover:opacity-100" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const GALLERY_SHAPES = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[2/3]"];

export function GalleryBlock({ block }: { block: BlockOf<"gallery"> }) {
  if (!block.items.length) return null;
  const tile = (item: BlockOf<"gallery">["items"][number], cls?: string) => {
    const body = (
      <>
        <SmartImage src={item.image} alt={item.caption} className="absolute inset-0" imgClassName="transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/35" />
        {item.caption && (
          <span className="absolute inset-x-3 bottom-3 translate-y-2 text-sm font-medium text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            {item.caption}
          </span>
        )}
      </>
    );
    const c = cn("group relative block overflow-hidden rounded-sm bg-luxury-100 dark:bg-zinc-900", cls);
    return item.link ? <Link href={item.link} className={c}>{body}</Link> : <div className={c}>{body}</div>;
  };

  return (
    <section className={cn(block.layout === "grid" && "container-page")}>
      <div className={cn(block.layout === "strip" && "container-page")}>
        <SectionHead eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} align="center" />
      </div>
      {block.layout === "strip" ? (
        <Marquee duration={Math.max(30, block.items.length * 6)}>
          {block.items.map((item, i) => (
            <div key={i} className="mx-2 w-56 sm:w-72">{tile(item, "aspect-[4/5]")}</div>
          ))}
        </Marquee>
      ) : (
        // Masonry columns: varied photo shapes without gaps, whatever the number of photos.
        <div className="columns-2 gap-3 sm:gap-4 lg:columns-4">
          {block.items.map((item, i) => (
            <Reveal key={i} delay={(i % 4) * 70} className="mb-3 break-inside-avoid sm:mb-4">
              {tile(item, GALLERY_SHAPES[i % GALLERY_SHAPES.length])}
            </Reveal>
          ))}
        </div>
      )}
      {block.buttonText && block.link && (
        <div className="mt-10 text-center">
          <CTA text={block.buttonText} href={block.link} />
        </div>
      )}
    </section>
  );
}

const MARQUEE_SPEED = { slow: 60, normal: 38, fast: 22 };

export function MarqueeBlock({ block }: { block: BlockOf<"marquee"> }) {
  const brand = block.style === "brand";
  return (
    <section className={cn("overflow-hidden py-6 sm:py-10", brand && "bg-brand text-brand-fg")} aria-label={block.items.join(", ")}>
      <Marquee duration={MARQUEE_SPEED[block.speed]}>
        {[...block.items, ...block.items].map((t, i) => (
          <span key={i} className="flex items-center" aria-hidden>
            <span className={cn("whitespace-nowrap px-6 font-serif text-5xl uppercase leading-none sm:px-10 sm:text-8xl", block.style === "outline" && "text-outline")}>{t}</span>
            <span className={cn("text-3xl sm:text-5xl", brand ? "" : "text-brand")}>✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}

export function VideoBlock({ block }: { block: BlockOf<"video"> }) {
  const id = youtubeId(block.youtubeUrl);
  if (!id) return null;
  return (
    <section className="container-page">
      <SectionHead eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} align="center" />
      <Reveal className="relative aspect-video overflow-hidden rounded-sm bg-zinc-950 shadow-2xl">
        <VideoEmbed videoId={id} cover={block.cover} title={block.title} />
      </Reveal>
    </section>
  );
}

export function TextBlock({ block }: { block: BlockOf<"text"> }) {
  const center = block.align === "center";
  return (
    <section className="container-page">
      <Reveal className={cn("max-w-3xl space-y-6", center && "mx-auto text-center")}>
        {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">{block.eyebrow}</p>}
        {block.title && <h2 className="font-serif text-4xl leading-tight sm:text-6xl">{block.title}</h2>}
        <div className="space-y-4 text-lg text-luxury-600 dark:text-zinc-400">
          <Paragraphs body={block.body} />
        </div>
        <CTA text={block.buttonText} href={block.link} className="mt-2" />
      </Reveal>
    </section>
  );
}

export function FaqBlock({ block }: { block: BlockOf<"faq"> }) {
  if (!block.items.length) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: block.items.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };
  return (
    <section className="container-page">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionHead eyebrow={block.eyebrow} title={block.title} className="lg:sticky lg:top-28 lg:self-start" />
        <Reveal className="divide-y divide-luxury-200 border-y border-luxury-200 dark:divide-zinc-800 dark:border-zinc-800">
          {block.items.map((q, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium">
                {q.question}
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-luxury-300 transition-all duration-300 group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-brand-fg dark:border-zinc-700">
                  <Plus size={16} />
                </span>
              </summary>
              <div className="mt-3 max-w-2xl space-y-3 text-luxury-600 dark:text-zinc-400">
                <Paragraphs body={q.answer} />
              </div>
            </details>
          ))}
        </Reveal>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </section>
  );
}
