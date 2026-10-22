// Typed, validated website settings edited from the admin panel.
// Pure module (no server imports) so the seed script and client forms can share it.
import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #c5a880");

const safeLink = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")) || /^https?:\/\//i.test(v), {
    message: "Must be a path starting with / or a full http(s) link",
  });

const imageUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || v.startsWith("/api/images/") || v.startsWith("/") || /^https:\/\//i.test(v), {
    message: "Image must be an uploaded image or an https:// link",
  });

const text = (max: number) => z.string().trim().max(max);

/** Search-engine ownership code. Accepts the bare code or the whole <meta … content="…"> tag. */
const verificationCode = z
  .string()
  .trim()
  .max(300)
  .transform((v) => v.match(/content=["']([^"']+)["']/i)?.[1] ?? v)
  .refine((v) => /^[A-Za-z0-9_-]{0,100}$/.test(v), "Paste the code (or the whole meta tag) from the search engine");
const money = z.number().int().min(0).max(100_000_000); // paise
const keysOf = <T extends Record<string, unknown>>(o: T) => Object.keys(o) as [keyof T & string, ...Array<keyof T & string>];

/** Icons the admin can pick for highlights, services and badges (rendered by components/ui/Icon). */
export const ICONS = ["truck", "refresh", "card", "shield", "gift", "star", "phone", "leaf", "ruler", "sparkles", "heart", "clock", "package", "map", "scissors", "badge"] as const;
export type IconName = (typeof ICONS)[number];
/** @deprecated kept for older imports — use ICONS. */
export const SERVICE_ICONS = ICONS;

// ─── Store settings ──────────────────────────────────────────

export const storeSettingsSchema = z.object({
  storeName: text(80).min(1),
  logoText: text(40).min(1),
  tagline: text(160),
  contactEmail: z.string().trim().email().max(120),
  contactPhone: text(30),
  whatsappNumber: text(20),
  address: text(300),
  businessHours: text(120),
  gstin: text(20),
  social: z.object({
    instagram: safeLink,
    facebook: safeLink,
    youtube: safeLink,
  }),
  seo: z.object({
    title: text(120),
    description: text(300),
    googleVerification: verificationCode.default(""),
    bingVerification: verificationCode.default(""),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    text: text(160),
    link: safeLink,
  }),
  shipping: z.object({
    flatFee: money,
    freeShippingThreshold: money, // 0 = shipping always charged unless flatFee is 0
    estimatedDelivery: text(80),
  }),
  tax: z.object({
    ratePercent: z.number().min(0).max(40),
    pricesIncludeTax: z.boolean(),
  }),
  payments: z.object({
    codEnabled: z.boolean(),
    codMaxOrderValue: money, // 0 = no limit
    onlineEnabled: z.boolean(),
  }),
  orders: z.object({
    requireEmailVerification: z.boolean(),
    returnWindowDays: z.number().int().min(0).max(60),
    lowStockThreshold: z.number().int().min(0).max(1000),
    notifyEmail: z.union([z.literal(""), z.string().trim().email()]),
  }),
});
export type StoreSettings = z.infer<typeof storeSettingsSchema>;

export const defaultStoreSettings: StoreSettings = {
  storeName: "Prabodh Kumar Mahato Clothing",
  logoText: "PRABODH KUMAR MAHATO",
  tagline: "Premium clothing, heritage weaves and everyday essentials.",
  contactEmail: "contact@example.com",
  contactPhone: "+91 98765 43210",
  whatsappNumber: "",
  address: "Chowka, Jharkhand, Pincode 832404",
  businessHours: "Mon – Sat, 10:00 AM – 8:00 PM",
  gstin: "",
  social: { instagram: "https://instagram.com", facebook: "https://facebook.com", youtube: "" },
  seo: {
    title: "Prabodh Kumar Mahato | Premium Clothing Store",
    description: "Shop premium linens, Banarasi silk sarees, ethnic wear, denim and everyday essentials with fast delivery across India.",
    googleVerification: "",
    bingVerification: "",
  },
  announcement: { enabled: true, text: "Free shipping on orders above ₹1,999 · Easy 7-day returns", link: "/shop" },
  shipping: { flatFee: 9900, freeShippingThreshold: 199900, estimatedDelivery: "3–7 business days" },
  tax: { ratePercent: 5, pricesIncludeTax: true },
  payments: { codEnabled: true, codMaxOrderValue: 2500000, onlineEnabled: true },
  orders: { requireEmailVerification: false, returnWindowDays: 7, lowStockThreshold: 5, notifyEmail: "" },
};

// ─── Appearance (theme) ──────────────────────────────────────

export const HEADING_FONTS = {
  playfair: "Playfair Display — classic, elegant serif",
  cormorant: "Cormorant Garamond — couture, refined",
  "dm-serif": "DM Serif Display — bold, editorial",
  marcellus: "Marcellus — heritage, engraved",
  outfit: "Outfit — clean, modern sans-serif",
} as const;
export const BODY_FONTS = {
  inter: "Inter — neutral and very readable",
  "dm-sans": "DM Sans — friendly, geometric",
  jost: "Jost — fashion, geometric",
} as const;
export const LOGO_FONTS = {
  outfit: "Outfit — modern, spaced capitals",
  playfair: "Playfair Display — classic serif",
  cormorant: "Cormorant Garamond — couture",
  "dm-serif": "DM Serif Display — bold serif",
  marcellus: "Marcellus — heritage",
} as const;

export const CARD_RATIOS = { portrait: "Portrait (3:4)", classic: "Classic (4:5)", tall: "Tall (2:3)", square: "Square (1:1)" } as const;

export const themeSettingsSchema = z.object({
  primaryColor: hexColor,
  headingFont: z.enum(keysOf(HEADING_FONTS)),
  bodyFont: z.enum(keysOf(BODY_FONTS)),
  logoFont: z.enum(keysOf(LOGO_FONTS)),
  corners: z.enum(["sharp", "soft", "rounded"]),
  buttons: z.enum(["pill", "rounded", "square"]),
  colorMode: z.enum(["system", "light", "dark"]),
  allowThemeToggle: z.boolean(),
  animations: z.boolean(),
  logo: z.object({
    image: imageUrl, // empty = show the logo text
    darkImage: imageUrl, // optional light-coloured version for dark backgrounds
    height: z.number().int().min(16).max(96),
  }),
  favicon: imageUrl,
  header: z.object({
    transparentOnHero: z.boolean(),
    megaMenu: z.boolean(),
  }),
  productCard: z.object({
    imageRatio: z.enum(keysOf(CARD_RATIOS)),
    hoverImage: z.boolean(),
    quickAdd: z.boolean(),
    showRating: z.boolean(),
    showCategory: z.boolean(),
    showColors: z.boolean(),
    lowStockBadgeAt: z.number().int().min(0).max(50), // 0 = never show "Only N left"
  }),
});
export type ThemeSettings = z.infer<typeof themeSettingsSchema>;

export const defaultThemeSettings: ThemeSettings = {
  primaryColor: "#c5a880",
  headingFont: "playfair",
  bodyFont: "inter",
  logoFont: "outfit",
  corners: "sharp",
  buttons: "pill",
  colorMode: "system",
  allowThemeToggle: true,
  animations: true,
  logo: { image: "", darkImage: "", height: 40 },
  favicon: "",
  header: { transparentOnHero: true, megaMenu: true },
  productCard: { imageRatio: "portrait", hoverImage: true, quickAdd: true, showRating: true, showCategory: true, showColors: true, lowStockBadgeAt: 3 },
};

// ─── Navigation (header menu + footer) ───────────────────────

const navLink = z.object({
  label: text(40).min(1, "Link text is required"),
  href: safeLink.refine((v) => v !== "", "Link is required"),
  highlight: z.boolean().default(false),
});
export type NavLink = z.infer<typeof navLink>;

export const navigationSettingsSchema = z.object({
  headerLinks: z.array(navLink).max(8),
  footer: z.object({
    about: text(400), // empty = store tagline
    columns: z
      .array(
        z.object({
          title: text(40).min(1, "Column title is required"),
          autoCategories: z.boolean(), // list active categories automatically
          links: z.array(navLink).max(12),
        }),
      )
      .max(4),
    showNewsletter: z.boolean(),
    newsletterTitle: text(60),
    newsletterText: text(200),
    showWordmark: z.boolean(),
    wordmarkText: text(30), // empty = first word of the logo text
    showPaymentIcons: z.boolean(),
    bottomLinks: z.array(navLink).max(6),
    copyright: text(200), // empty = "© <year> <store name>. All rights reserved."
  }),
});
export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

export const defaultNavigationSettings: NavigationSettings = {
  headerLinks: [
    { label: "Men", href: "/shop?gender=men", highlight: false },
    { label: "Women", href: "/shop?gender=women", highlight: false },
    { label: "Kids", href: "/shop?gender=kids", highlight: false },
    { label: "Offers", href: "/offers", highlight: true },
    { label: "Journal", href: "/blog", highlight: false },
  ],
  footer: {
    about: "",
    columns: [
      {
        title: "Shop",
        autoCategories: true,
        links: [
          { label: "All products", href: "/shop", highlight: false },
          { label: "Offers", href: "/offers", highlight: false },
        ],
      },
      {
        title: "Help",
        autoCategories: false,
        links: [
          { label: "Track your order", href: "/account/orders", highlight: false },
          { label: "Shipping", href: "/policies/shipping", highlight: false },
          { label: "Returns & refunds", href: "/policies/returns", highlight: false },
          { label: "Contact us", href: "/contact", highlight: false },
          { label: "About us", href: "/about", highlight: false },
          { label: "Journal", href: "/blog", highlight: false },
        ],
      },
    ],
    showNewsletter: true,
    newsletterTitle: "Newsletter",
    newsletterText: "New arrivals and private offers, straight to your inbox.",
    showWordmark: true,
    wordmarkText: "",
    showPaymentIcons: true,
    bottomLinks: [
      { label: "Privacy", href: "/policies/privacy", highlight: false },
      { label: "Terms", href: "/policies/terms", highlight: false },
    ],
    copyright: "",
  },
};

// ─── Product page ────────────────────────────────────────────

export const productPageSettingsSchema = z.object({
  showDeliveryInfo: z.boolean(), // delivery estimate, returns and COD lines (from store settings)
  highlights: z.array(z.object({ icon: z.enum(ICONS), text: text(120).min(1) })).max(6),
  showShare: z.boolean(),
  showReviews: z.boolean(),
  showCompleteTheLook: z.boolean(),
  completeTheLookTitle: text(60),
  showRecentlyViewed: z.boolean(),
  sizeGuide: z.object({
    enabled: z.boolean(),
    intro: text(400),
    columns: z.array(text(24)).min(1).max(6),
    rows: z.array(z.array(text(24)).max(6)).max(24),
    note: text(300),
  }),
});
export type ProductPageSettings = z.infer<typeof productPageSettingsSchema>;

export const defaultProductPageSettings: ProductPageSettings = {
  showDeliveryInfo: true,
  highlights: [{ icon: "shield", text: "100% genuine, quality-checked before dispatch" }],
  showShare: true,
  showReviews: true,
  showCompleteTheLook: true,
  completeTheLookTitle: "Complete the Look",
  showRecentlyViewed: true,
  sizeGuide: {
    enabled: true,
    intro: "Measurements are body measurements in inches. If you are between sizes, choose the larger size for a relaxed fit.",
    columns: ["Size", "Chest", "Waist", "Hip"],
    rows: [
      ["XS", "32–34", "26–28", "34–36"],
      ["S", "34–36", "28–30", "36–38"],
      ["M", "38–40", "32–34", "38–40"],
      ["L", "40–42", "34–36", "40–42"],
      ["XL", "42–44", "36–38", "42–44"],
      ["XXL", "44–46", "38–40", "44–46"],
    ],
    note: "For trousers & jeans, the number size is your waist in inches (e.g. 32).",
  },
};

// ─── Popups & chat ───────────────────────────────────────────

export const engagementSettingsSchema = z.object({
  popup: z.object({
    enabled: z.boolean(),
    showOn: z.enum(["home", "all"]),
    delaySeconds: z.number().int().min(0).max(120),
    frequencyDays: z.number().int().min(1).max(365), // don't show again to the same visitor for this many days
    image: imageUrl,
    eyebrow: text(40),
    title: text(80),
    text: text(300),
    couponCode: text(30),
    collectEmail: z.boolean(),
    buttonText: text(30),
    link: safeLink,
  }),
  whatsapp: z.object({
    enabled: z.boolean(),
    message: text(200),
  }),
  freeShippingBar: z.boolean(),
});
export type EngagementSettings = z.infer<typeof engagementSettingsSchema>;

export const defaultEngagementSettings: EngagementSettings = {
  popup: {
    enabled: false,
    showOn: "home",
    delaySeconds: 8,
    frequencyDays: 7,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80",
    eyebrow: "Welcome",
    title: "10% off your first order",
    text: "Join our list for early access to new arrivals and private offers.",
    couponCode: "",
    collectEmail: true,
    buttonText: "Start shopping",
    link: "/shop",
  },
  whatsapp: { enabled: true, message: "Hi! I have a question about your products." },
  freeShippingBar: true,
};

// ─── Homepage ────────────────────────────────────────────────

export const HOMEPAGE_SECTIONS = {
  hero: "Hero banner carousel",
  services: "Service highlights bar",
  categories: "Shop by category",
  "new-arrivals": "New arrivals",
  promo: "Promotional banner",
  "best-sellers": "Best sellers",
  "flash-sale": "Flash sale with countdown",
  featured: "Featured products",
  trending: "Trending now",
  "brand-story": "Brand story",
  testimonials: "Customer reviews",
  newsletter: "Newsletter sign-up",
} as const;
export type HomepageSectionId = keyof typeof HOMEPAGE_SECTIONS;
export const isBuiltInSection = (id: string): id is HomepageSectionId => id in HOMEPAGE_SECTIONS;

/** Reusable content blocks the admin can add to the homepage any number of times. */
export const BLOCK_TYPES = {
  products: { label: "Product collection", description: "Products from a category, audience, tag or the sale — as a carousel or grid." },
  banner: { label: "Image banner", description: "Full-width photo with a headline and button." },
  "image-text": { label: "Image with text", description: "Photo beside a story, with an optional button." },
  categories: { label: "Category tiles", description: "Pick categories to show as photo tiles or circles." },
  gallery: { label: "Lookbook / gallery", description: "A grid or scrolling strip of photos, e.g. Instagram looks." },
  marquee: { label: "Scrolling text", description: "Large moving text — great for sale messages." },
  video: { label: "Video", description: "A YouTube video with a cover image." },
  text: { label: "Text", description: "A heading with a paragraph and an optional button." },
  faq: { label: "FAQ", description: "Questions and answers that expand on click." },
} as const;
export type BlockType = keyof typeof BLOCK_TYPES;

export const PRODUCT_SOURCES = {
  new: "New arrivals",
  best: "Best sellers",
  featured: "Featured",
  trending: "Trending",
  sale: "On sale (discounted)",
  flash: "Flash sale",
  newest: "Newest products",
  category: "A category",
  gender: "An audience (Men, Women…)",
} as const;

const blockId = z.string().regex(/^block-[a-z0-9-]{1,40}$/);
const heading = z.object({ eyebrow: text(60), title: text(100) });
const button = { buttonText: text(30), link: safeLink };

const blockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("products"),
    id: blockId,
    eyebrow: text(60),
    title: text(100),
    source: z.enum(keysOf(PRODUCT_SOURCES)),
    category: text(80), // category slug when source = category
    gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
    limit: z.number().int().min(2).max(24),
    layout: z.enum(["rail", "grid"]),
    ...button,
  }),
  z.object({
    type: z.literal("banner"),
    id: blockId,
    image: imageUrl.refine((v) => v !== "", "Banner image is required"),
    mobileImage: imageUrl,
    eyebrow: text(60),
    title: text(100),
    subtitle: text(240),
    ...button,
    align: z.enum(["left", "center", "right"]),
    height: z.enum(["medium", "large", "full"]),
    overlay: z.number().int().min(0).max(90),
    parallax: z.boolean(),
  }),
  z.object({
    type: z.literal("image-text"),
    id: blockId,
    image: imageUrl,
    eyebrow: text(60),
    title: text(120),
    body: text(3000),
    ...button,
    imageSide: z.enum(["left", "right"]),
    background: z.enum(["plain", "tinted", "dark"]),
  }),
  z.object({
    type: z.literal("categories"),
    id: blockId,
    eyebrow: text(60),
    title: text(100),
    slugs: z.array(text(80)).max(12), // empty = all active categories
    style: z.enum(["tiles", "circles"]),
  }),
  z.object({
    type: z.literal("gallery"),
    id: blockId,
    eyebrow: text(60),
    title: text(100),
    subtitle: text(240),
    ...button,
    layout: z.enum(["grid", "strip"]),
    items: z.array(z.object({ image: imageUrl.refine((v) => v !== "", "Image is required"), link: safeLink, caption: text(80) })).max(16),
  }),
  z.object({
    type: z.literal("marquee"),
    id: blockId,
    items: z.array(text(60).min(1)).min(1).max(10),
    style: z.enum(["outline", "solid", "brand"]),
    speed: z.enum(["slow", "normal", "fast"]),
  }),
  z.object({
    type: z.literal("video"),
    id: blockId,
    eyebrow: text(60),
    title: text(100),
    subtitle: text(240),
    youtubeUrl: z
      .string()
      .trim()
      .max(300)
      .refine((v) => v === "" || /^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//i.test(v), "Paste a YouTube link"),
    cover: imageUrl,
  }),
  z.object({
    type: z.literal("text"),
    id: blockId,
    eyebrow: text(60),
    title: text(120),
    body: text(3000),
    ...button,
    align: z.enum(["left", "center"]),
  }),
  z.object({
    type: z.literal("faq"),
    id: blockId,
    eyebrow: text(60),
    title: text(100),
    items: z.array(z.object({ question: text(200).min(1), answer: text(2000) })).max(24),
  }),
]);
export type HomepageBlock = z.infer<typeof blockSchema>;
export type BlockOf<T extends BlockType> = Extract<HomepageBlock, { type: T }>;

const bannerSchema = z.object({
  id: z.string().min(1).max(40),
  eyebrow: text(60),
  title: text(80).min(1),
  description: text(240),
  buttonText: text(30),
  link: safeLink,
  secondaryText: text(30).default("Explore all"),
  secondaryLink: safeLink.default("/shop"),
  image: imageUrl.refine((v) => v !== "", "Banner image is required"),
  mobileImage: imageUrl.default(""),
  align: z.enum(["left", "center"]),
  overlay: z.number().int().min(0).max(90).default(55),
  startsAt: z.string().max(40).default(""), // ISO date-time; empty = always
  endsAt: z.string().max(40).default(""),
});
export type Banner = z.infer<typeof bannerSchema>;

export const homepageSettingsSchema = z.object({
  sections: z
    .array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,48}$/), enabled: z.boolean() }))
    .max(50),
  hero: z.object({
    height: z.enum(["full", "large", "medium"]),
    autoplaySeconds: z.number().int().min(3).max(30),
    kenBurns: z.boolean(),
  }),
  banners: z.array(bannerSchema).max(8),
  services: z
    .array(z.object({ icon: z.enum(ICONS), title: text(40), description: text(80) }))
    .max(6),
  sectionText: z.object({
    categories: heading,
    "new-arrivals": heading,
    "best-sellers": heading,
    featured: heading,
    trending: heading,
    testimonials: heading,
  }),
  promo: z.object({
    eyebrow: text(60),
    title: text(100),
    subtitle: text(240),
    buttonText: text(30),
    link: safeLink,
    image: imageUrl,
  }),
  flashSale: z.object({
    badge: text(40),
    title: text(80),
    subtitle: text(240),
    endsAt: z.string().max(40), // ISO date-time; empty = no countdown
    buttonText: text(30),
    link: safeLink,
  }),
  brandStory: z.object({
    eyebrow: text(40),
    title: text(120),
    body: text(2000),
    image: imageUrl,
    badgeTitle: text(30),
    badgeText: text(40),
    buttonText: text(30),
    link: safeLink,
  }),
  newsletter: z.object({
    eyebrow: text(40),
    title: text(80),
    description: text(240),
  }),
  blocks: z.array(blockSchema).max(30),
});
export type HomepageSettings = z.infer<typeof homepageSettingsSchema>;

export const defaultHomepageSettings: HomepageSettings = {
  sections: [
    { id: "hero", enabled: true },
    { id: "services", enabled: true },
    { id: "categories", enabled: true },
    { id: "new-arrivals", enabled: true },
    { id: "promo", enabled: true },
    { id: "best-sellers", enabled: true },
    { id: "flash-sale", enabled: true },
    { id: "featured", enabled: false },
    { id: "trending", enabled: false },
    { id: "brand-story", enabled: true },
    { id: "testimonials", enabled: true },
    { id: "newsletter", enabled: true },
  ],
  hero: { height: "full", autoplaySeconds: 7, kenBurns: true },
  banners: [
    {
      id: "banner-1",
      eyebrow: "New season",
      title: "The Summer Couture",
      description: "Linen, silk and breathable tailoring crafted for warm days and long evenings.",
      buttonText: "Shop the collection",
      link: "/shop",
      secondaryText: "Explore all",
      secondaryLink: "/shop",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&auto=format&fit=crop&q=80",
      mobileImage: "",
      align: "left",
      overlay: 55,
      startsAt: "",
      endsAt: "",
    },
    {
      id: "banner-2",
      eyebrow: "Heritage ethnic wear",
      title: "Handwoven Silks & Embroidered Kurtas",
      description: "Zardozi embroidery and authentic Banarasi silks designed for timeless celebrations.",
      buttonText: "Shop ethnic",
      link: "/shop?gender=women",
      secondaryText: "Explore all",
      secondaryLink: "/shop",
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=1800&auto=format&fit=crop&q=80",
      mobileImage: "",
      align: "left",
      overlay: 55,
      startsAt: "",
      endsAt: "",
    },
  ],
  services: [
    { icon: "truck", title: "Free shipping", description: "On orders above ₹1,999" },
    { icon: "refresh", title: "Easy returns", description: "7-day hassle-free returns" },
    { icon: "card", title: "Secure payments", description: "UPI, cards & cash on delivery" },
    { icon: "shield", title: "100% genuine", description: "Quality-checked fabrics" },
  ],
  sectionText: {
    categories: { eyebrow: "Curated for you", title: "Shop by Category" },
    "new-arrivals": { eyebrow: "Just dropped", title: "New Arrivals" },
    "best-sellers": { eyebrow: "Customer favourites", title: "Best Sellers" },
    featured: { eyebrow: "Handpicked", title: "Featured" },
    trending: { eyebrow: "What's hot", title: "Trending Now" },
    testimonials: { eyebrow: "Loved by our customers", title: "What People Say" },
  },
  promo: {
    eyebrow: "Limited time",
    title: "Festive Offers Are Here",
    subtitle: "Up to 35% off handwoven Banarasi sarees and premium suits. Use code FESTIVE10 for an extra 10% off.",
    buttonText: "View offers",
    link: "/offers",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80",
  },
  flashSale: {
    badge: "Flash sale",
    title: "Mid-Season Clearance",
    subtitle: "Supima tees, raw denim and linen at limited-time prices.",
    endsAt: "",
    buttonText: "Shop the sale",
    link: "/shop?sale=1",
  },
  brandStory: {
    eyebrow: "Our philosophy",
    title: "Weaving Heritage with Modern Craft",
    body:
      "Founded with a dedication to premium materials and traditional textile crafts, our store focuses on longevity, comfort and timeless style. Every fabric is hand-selected from weavers and mills we trust.\n\nWe believe clothes should last for years, not a season — comfortable fits, honest prices, and respect for the artisans who make them.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
    badgeTitle: "Handpicked",
    badgeText: "fabrics & finishes",
    buttonText: "Read our story",
    link: "/about",
  },
  newsletter: {
    eyebrow: "The inner circle",
    title: "Get early access to new arrivals",
    description: "Subscribe for new collection launches, private offers and styling notes. No spam — unsubscribe any time.",
  },
  blocks: [],
};

/** A fresh block of the given type with sensible starter content, used by the homepage editor. */
export function newBlock(type: BlockType): HomepageBlock {
  const id = `block-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  switch (type) {
    case "products":
      return { type, id, eyebrow: "Shop now", title: "Our Picks", source: "newest", category: "", gender: "WOMEN", limit: 8, layout: "rail", buttonText: "View all", link: "/shop" };
    case "banner":
      return { type, id, image: "", mobileImage: "", eyebrow: "", title: "Your headline", subtitle: "", buttonText: "Shop now", link: "/shop", align: "center", height: "large", overlay: 45, parallax: true };
    case "image-text":
      return { type, id, image: "", eyebrow: "", title: "Tell your story", body: "", buttonText: "", link: "", imageSide: "left", background: "plain" };
    case "categories":
      return { type, id, eyebrow: "", title: "Shop by Category", slugs: [], style: "circles" };
    case "gallery":
      return { type, id, eyebrow: "@yourstore", title: "Styled by You", subtitle: "", buttonText: "", link: "", layout: "grid", items: [] };
    case "marquee":
      return { type, id, items: ["New season", "Free shipping", "Easy returns"], style: "outline", speed: "normal" };
    case "video":
      return { type, id, eyebrow: "", title: "Behind the craft", subtitle: "", youtubeUrl: "", cover: "" };
    case "text":
      return { type, id, eyebrow: "", title: "A heading", body: "", buttonText: "", link: "", align: "center" };
    case "faq":
      return { type, id, eyebrow: "Help", title: "Frequently Asked Questions", items: [{ question: "How long does delivery take?", answer: "Orders are delivered in 3–7 business days across India." }] };
  }
}

// ─── Pages (about + policies) ────────────────────────────────

export const POLICY_PAGES = {
  shipping: "Shipping Policy",
  returns: "Returns & Refunds",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
} as const;
export type PolicySlug = keyof typeof POLICY_PAGES;

export const pagesSettingsSchema = z.object({
  about: z.object({ title: text(120), body: text(10000), image: imageUrl }),
  policies: z.object({
    shipping: text(20000),
    returns: text(20000),
    privacy: text(20000),
    terms: text(20000),
  }),
});
export type PagesSettings = z.infer<typeof pagesSettingsSchema>;

export const defaultPagesSettings: PagesSettings = {
  about: {
    title: "Our Story",
    body:
      "We started as a small family clothing shop with a simple promise: honest quality at fair prices.\n\nToday we bring the same care online — from handwoven sarees and festive ethnic wear to everyday cottons and denim. Every piece is checked by hand before it is packed for you.\n\n## Visit us\nYou are always welcome at our store. Find our address and hours on the Contact page.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80",
  },
  policies: {
    shipping:
      "## Delivery times\nOrders are packed within 1–2 business days and delivered within 3–7 business days across India.\n\n## Shipping charges\nShipping is free on orders above the free-shipping threshold shown at checkout. A flat fee applies to smaller orders.\n\n## Tracking\nOnce your order ships you will receive the courier name and tracking number by email and in My Account → Orders.",
    returns:
      "## Return window\nYou can request a return within 7 days of delivery from My Account → Orders. Items must be unused, unwashed and have original tags.\n\n## Refunds\nOnline payments are refunded to the original payment method within 5–7 business days after we receive the item. Cash on Delivery orders are refunded by bank transfer/UPI.\n\n## Non-returnable items\nUndergarments, customised and altered items cannot be returned for hygiene reasons.",
    privacy:
      "## What we collect\nWe collect your name, contact details and delivery address to process orders. Payments are processed securely by our payment partner — we never see or store your card details.\n\n## How we use it\nOnly to fulfil your orders, provide support and — if you subscribe — send our newsletter.\n\n## Your rights\nYou can update your details from My Account, or contact us to delete your account.",
    terms:
      "## Orders\nAll orders are subject to availability and confirmation. Prices are listed in Indian Rupees.\n\n## Accounts\nYou are responsible for keeping your password confidential.\n\n## Contact\nFor any questions about these terms, please contact us using the details on our Contact page.",
  },
};

// ─── Registry ────────────────────────────────────────────────

export const SETTINGS = {
  store: { schema: storeSettingsSchema, defaults: defaultStoreSettings, adminOnly: true, previewable: false },
  theme: { schema: themeSettingsSchema, defaults: defaultThemeSettings, adminOnly: false, previewable: true },
  navigation: { schema: navigationSettingsSchema, defaults: defaultNavigationSettings, adminOnly: false, previewable: true },
  homepage: { schema: homepageSettingsSchema, defaults: defaultHomepageSettings, adminOnly: false, previewable: true },
  productPage: { schema: productPageSettingsSchema, defaults: defaultProductPageSettings, adminOnly: false, previewable: true },
  engagement: { schema: engagementSettingsSchema, defaults: defaultEngagementSettings, adminOnly: false, previewable: true },
  pages: { schema: pagesSettingsSchema, defaults: defaultPagesSettings, adminOnly: false, previewable: false },
} as const;
export type SettingKey = keyof typeof SETTINGS;
export type SettingValue<K extends SettingKey> = z.infer<(typeof SETTINGS)[K]["schema"]>;

/** Settings row key that holds an unpublished draft shown only in the admin live preview. */
export const draftKey = (key: SettingKey) => `draft:${key}`;
