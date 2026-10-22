"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, Minus, Plus, RefreshCw, Ruler, Share2, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Stars } from "@/components/ui/Misc";
import { discountPercent, formatINR } from "@/lib/money";
import { MAX_QTY_PER_LINE } from "@/lib/constants";
import { defaultProductPageSettings, type ProductPageSettings } from "@/lib/settings-schema";
import Icon from "@/components/ui/Icon";
import { cn, textBlocks } from "@/lib/utils";

type Variant = { id: string; size: string; color: string; colorHex: string | null; stock: number; price: number };

type Props = {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    compareAtPrice: number | null;
    categoryName: string | null;
    ratingAvg: number;
    ratingCount: number;
    description: string;
    fabric: string | null;
    fit: string | null;
    careInstructions: string | null;
  };
  variants: Variant[];
  sizeOrder: string[];
  delivery: { estimate: string; freeAbove: number; returnDays: number; cod: boolean; taxIncluded: boolean };
  /** Product page options from Admin → Product page. */
  page?: PurchasePageOptions;
  /** Slimmer layout used inside the Quick view panel. */
  compact?: boolean;
  onAdded?: () => void;
};

export type PurchasePageOptions = Pick<ProductPageSettings, "showDeliveryInfo" | "highlights" | "showShare" | "sizeGuide">;

export default function ProductPurchase({ product, variants, sizeOrder, delivery, page = defaultProductPageSettings, compact, onAdded }: Props) {
  const guide = page.sizeGuide;
  const router = useRouter();
  const { add, openDrawer } = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; hex: string | null; inStock: boolean }>();
    for (const v of variants) {
      const existing = map.get(v.color);
      map.set(v.color, { name: v.color, hex: v.colorHex, inStock: (existing?.inStock ?? false) || v.stock > 0 });
    }
    return [...map.values()];
  }, [variants]);

  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [color, setColor] = useState<string>(firstInStock?.color ?? "");
  const [size, setSize] = useState<string | null>(variants.length === 1 ? variants[0].size : null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  // On phones, show a pinned "Add to bag" bar once the main button scrolls out of view.
  useEffect(() => {
    if (compact || !addRef.current || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(([e]) => setShowStickyBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    obs.observe(addRef.current);
    return () => obs.disconnect();
  }, [compact]);

  const sizesForColor = sizeOrder
    .map((s) => variants.find((v) => v.size === s && v.color === color))
    .filter((v): v is Variant => Boolean(v));
  const selected = size ? variants.find((v) => v.color === color && v.size === size) : undefined;
  const price = selected?.price ?? product.price;
  const off = discountPercent(price, product.compareAtPrice);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const maxQty = Math.min(selected?.stock ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
  const liked = wishlist.has(product.id);
  const singleSize = sizeOrder.length === 1;

  const purchase = async (mode: "add" | "buy") => {
    if (!selected) {
      setSizeError(true);
      sizesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(mode);
    const res = await add(selected.id, quantity);
    setBusy(null);
    if (!res.ok) {
      toast(res.message ?? "Could not add to bag", "error");
      return;
    }
    onAdded?.();
    if (mode === "buy") router.push("/checkout");
    else openDrawer();
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied to clipboard");
      }
    } catch {
      // share cancelled
    }
  };

  const Title = compact ? "h2" : "h1";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {product.categoryName && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{product.categoryName}</p>}
        <Title className={cn("font-serif leading-tight", compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl")}>{product.title}</Title>
        {product.ratingCount > 0 && (
          <a href="#reviews" className="inline-flex items-center gap-2 text-sm text-luxury-600 hover:underline dark:text-zinc-400">
            <Stars rating={product.ratingAvg} /> {product.ratingAvg.toFixed(1)} · {product.ratingCount} {product.ratingCount === 1 ? "review" : "reviews"}
          </a>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-3 border-b border-luxury-200 pb-6 dark:border-zinc-800">
        <span className="text-3xl font-semibold">{formatINR(price)}</span>
        {off > 0 && product.compareAtPrice && (
          <>
            <span className="text-lg text-luxury-400 line-through">{formatINR(product.compareAtPrice)}</span>
            <span className="rounded-sm bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-600 dark:bg-red-950/40">{off}% off</span>
          </>
        )}
        <span className="w-full text-xs text-luxury-500">{delivery.taxIncluded ? "Inclusive of all taxes" : "GST will be added at checkout"}</span>
      </div>

      {colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm">
            <span className="font-semibold">Colour:</span> <span className="text-luxury-600 dark:text-zinc-400">{color}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  setColor(c.name);
                  if (size && !variants.some((v) => v.color === c.name && v.size === size)) setSize(null);
                }}
                title={c.name}
                aria-label={`${c.name}${c.inStock ? "" : " (sold out)"}`}
                aria-pressed={color === c.name}
                className={cn(
                  "relative h-10 w-10 rounded-full border transition-all",
                  color === c.name ? "ring-2 ring-luxury-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-950" : "border-luxury-300 dark:border-zinc-600",
                  !c.inStock && "opacity-40",
                )}
                style={{ backgroundColor: c.hex ?? "#d4d4d4" }}
              >
                {!c.inStock && <span className="absolute left-1/2 top-1/2 h-px w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-luxury-500" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {!singleSize && (
        <div ref={sizesRef} className="scroll-mt-32">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">Size:</span> <span className="text-luxury-600 dark:text-zinc-400">{size ?? "Select a size"}</span>
            </p>
            {guide.enabled && guide.rows.length > 0 && (
              <button onClick={() => setGuideOpen(true)} className="flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline">
                <Ruler size={14} /> Size guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSize(v.size);
                  setSizeError(false);
                  setQuantity((q) => Math.min(q, Math.max(1, Math.min(v.stock, MAX_QTY_PER_LINE))));
                }}
                disabled={v.stock <= 0}
                aria-pressed={size === v.size}
                className={cn(
                  "relative h-11 min-w-[52px] rounded-sm border px-4 text-sm font-medium transition-colors",
                  size === v.size ? "border-luxury-900 bg-luxury-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-luxury-300 hover:border-luxury-900 dark:border-zinc-700 dark:hover:border-zinc-300",
                  v.stock <= 0 && "cursor-not-allowed text-luxury-400 line-through opacity-60",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
          {sizeError && <p className="mt-2 text-sm text-red-600" role="alert">Please select a size.</p>}
        </div>
      )}

      <div className="text-sm" aria-live="polite">
        {totalStock <= 0 ? (
          <p className="font-semibold text-luxury-500">Sold out — check back soon.</p>
        ) : selected ? (
          selected.stock <= 0 ? (
            <p className="font-semibold text-red-600">This size is sold out.</p>
          ) : selected.stock <= 5 ? (
            <p className="font-semibold text-red-600">Hurry — only {selected.stock} left in this size.</p>
          ) : (
            <p className="font-medium text-green-700 dark:text-green-400">In stock and ready to ship.</p>
          )
        ) : null}
      </div>

      <div ref={addRef} className="flex flex-wrap gap-3">
        <div className="flex h-12 items-center rounded-sm border border-luxury-300 dark:border-zinc-700">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex h-full w-11 items-center justify-center disabled:opacity-40" aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium" aria-label="Quantity">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} className="flex h-full w-11 items-center justify-center disabled:opacity-40" aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
        <Button size="lg" className="flex-1" onClick={() => purchase("add")} loading={busy === "add"} disabled={totalStock <= 0 || (selected && selected.stock <= 0)}>
          <ShoppingBag size={18} /> Add to bag
        </Button>
        <button
          onClick={() => wishlist.toggle(product.id)}
          className={cn("flex h-12 w-12 items-center justify-center rounded-sm border transition-colors", liked ? "border-red-300 bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/40" : "border-luxury-300 hover:border-luxury-900 dark:border-zinc-700")}
          aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <Button size="lg" variant="outline" fullWidth onClick={() => purchase("buy")} loading={busy === "buy"} disabled={totalStock <= 0 || (selected && selected.stock <= 0)}>
        Buy it now
      </Button>

      {compact ? (
        <Link href={`/product/${product.slug}`} className="group inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline">
          View full details <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
      <>
      {(page.showDeliveryInfo || page.highlights.length > 0) && (
        <ul className="grid gap-3 rounded-sm bg-luxury-100/70 p-4 text-sm dark:bg-zinc-900">
          {page.showDeliveryInfo && (
            <>
              <li className="flex gap-3">
                <Truck size={18} className="flex-shrink-0 text-brand" />
                <span>
                  Delivery in {delivery.estimate}.{delivery.freeAbove > 0 && <> Free shipping above {formatINR(delivery.freeAbove)}.</>}
                </span>
              </li>
              {delivery.returnDays > 0 && (
                <li className="flex gap-3">
                  <RefreshCw size={18} className="flex-shrink-0 text-brand" /> Easy {delivery.returnDays}-day returns.
                </li>
              )}
              {delivery.cod && (
                <li className="flex gap-3">
                  <Wallet size={18} className="flex-shrink-0 text-brand" /> Cash on Delivery available.
                </li>
              )}
            </>
          )}
          {page.highlights.map((h, i) => (
            <li key={i} className="flex gap-3">
              <Icon name={h.icon} size={18} className="flex-shrink-0 text-brand" /> {h.text}
            </li>
          ))}
        </ul>
      )}

      <div className="divide-y divide-luxury-200 border-y border-luxury-200 dark:divide-zinc-800 dark:border-zinc-800">
        <Details title="Description" defaultOpen>
          {textBlocks(product.description).map((b, i) =>
            b.type === "h" ? <h3 key={i} className="mb-2 mt-4 font-semibold">{b.text}</h3> : <p key={i} className="mb-3 leading-relaxed">{b.text}</p>,
          )}
        </Details>
        {(product.fabric || product.fit) && (
          <Details title="Fabric & fit">
            <dl className="grid grid-cols-[100px_1fr] gap-y-2">
              {product.fabric && (<><dt className="text-luxury-500">Fabric</dt><dd>{product.fabric}</dd></>)}
              {product.fit && (<><dt className="text-luxury-500">Fit</dt><dd>{product.fit}</dd></>)}
            </dl>
          </Details>
        )}
        {product.careInstructions && <Details title="Care">{product.careInstructions}</Details>}
      </div>

      {page.showShare && (
        <button onClick={share} className="flex items-center gap-2 text-sm text-luxury-600 hover:text-luxury-900 dark:text-zinc-400 dark:hover:text-white">
          <Share2 size={16} /> Share this product
        </button>
      )}
      </>
      )}

      {/* Pinned buy bar on phones */}
      {!compact && totalStock > 0 && (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t border-luxury-200 bg-white/95 p-3 backdrop-blur transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden",
            showStickyBar ? "translate-y-0" : "translate-y-full",
          )}
          aria-hidden={!showStickyBar}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.title}</p>
              <p className="text-sm font-semibold">
                {formatINR(price)}
                {size && <span className="ml-2 font-normal text-luxury-500">{color} · {size}</span>}
              </p>
            </div>
            <Button onClick={() => purchase("add")} loading={busy === "add"} disabled={selected ? selected.stock <= 0 : false} tabIndex={showStickyBar ? 0 : -1}>
              <ShoppingBag size={16} /> {selected ? "Add to bag" : "Select size"}
            </Button>
          </div>
        </div>
      )}

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Size guide">
        {guide.intro && <p className="mb-4 text-sm text-luxury-600 dark:text-zinc-400">{guide.intro}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-luxury-200 dark:border-zinc-700">
                {guide.columns.map((h, i) => (
                  <th key={i} className="py-2 pr-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-100 dark:divide-zinc-800">
              {guide.rows.map((row, r) => (
                <tr key={r}>
                  {guide.columns.map((_, i) => (
                    <td key={i} className={cn("py-2 pr-3", i === 0 && "font-semibold")}>{row[i] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {guide.note && <p className="mt-4 text-xs text-luxury-500">{guide.note}</p>}
      </Modal>
    </div>
  );
}

function Details({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group py-4" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        {title}
        <Plus size={16} className="transition-transform group-open:rotate-45" />
      </summary>
      <div className="mt-3 text-sm text-luxury-700 dark:text-zinc-300">{children}</div>
    </details>
  );
}
