/**
 * Idempotent seed. Safe to run on every deploy:
 *  - creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD if that account doesn't exist
 *  - stores default website settings if they don't exist
 *  - adds a demo catalog only when the store has no products and SEED_DEMO_DATA is not "false"
 * It never overwrites data you have changed.
 */
import { PrismaClient, type Gender, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultHomepageSettings, defaultPagesSettings, defaultStoreSettings } from "../src/lib/settings-schema";

// Load .env for local runs; hosted platforms provide real environment variables instead.
try {
  process.loadEnvFile?.(".env");
} catch {
  // no .env file — fine
}

const prisma = new PrismaClient();

const img = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;
const slug = (s: string) => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account creation.");
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin account ${email} already exists (left unchanged).`);
    return;
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  await prisma.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME?.trim() || "Store Owner",
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`✓ Created admin account ${email}. Sign in at /login and change the password under Account → Security.`);
}

async function seedSettings() {
  const defaults = { store: defaultStoreSettings, homepage: defaultHomepageSettings, pages: defaultPagesSettings };
  for (const [key, value] of Object.entries(defaults)) {
    const exists = await prisma.setting.findUnique({ where: { key } });
    if (!exists) {
      await prisma.setting.create({ data: { key, value: value as unknown as Prisma.InputJsonValue } });
      console.log(`✓ Default "${key}" settings created.`);
    }
  }
}

type DemoProduct = {
  title: string;
  description: string;
  price: number; // rupees
  compareAtPrice?: number;
  category: string;
  gender: Gender;
  images: string[];
  fabric: string;
  fit: string;
  care?: string;
  tags: string[];
  sizes: string[];
  colors: Array<[string, string]>;
  stock: number; // per variant
  flags: Partial<Record<"isFeatured" | "isNewArrival" | "isBestSeller" | "isTrending" | "isFlashSale", boolean>>;
};

const CATEGORIES: Array<{ name: string; gender: Gender | null; image: string; description: string }> = [
  { name: "Shirts", gender: "MEN", image: img("1621072156002-e2fcc103e86e"), description: "Linen, cotton and Oxford shirts for work and weekends." },
  { name: "Sarees", gender: "WOMEN", image: img("1610030469983-98e550d6193c"), description: "Handwoven Banarasi, Kanjeevaram and everyday sarees." },
  { name: "Ethnic Wear", gender: "WOMEN", image: img("1608748010899-18f300247112"), description: "Anarkalis, kurtas and festive sets." },
  { name: "Jeans", gender: "UNISEX", image: img("1542272604-787c3835535d"), description: "Denim in every fit." },
  { name: "T-Shirts", gender: "UNISEX", image: img("1521572267360-ee0c2909d518"), description: "Premium cotton basics." },
  { name: "Trousers", gender: "MEN", image: img("1624378439575-d8705ad7ae80"), description: "Chinos and tailored trousers." },
  { name: "Kids Wear", gender: "KIDS", image: img("1622290291468-a28f7a7dc6a8"), description: "Comfortable festive and everyday wear for kids." },
  { name: "Accessories", gender: null, image: img("1523275335684-37898b6baf30"), description: "Watches, bags and finishing touches." },
];

const PRODUCTS: DemoProduct[] = [
  {
    title: "Classic White Linen Shirt",
    description: "Crafted from 100% fine French linen, this shirt is breathable, light and perfect for smart-casual wear.\n\nModern slim fit with a point collar and single-button cuffs.",
    price: 2499, compareAtPrice: 3999, category: "Shirts", gender: "MEN",
    images: [img("1621072156002-e2fcc103e86e"), img("1603252109303-2751441dd157")],
    fabric: "100% Linen", fit: "Slim fit", care: "Machine wash cold, line dry, warm iron.",
    tags: ["linen", "summer", "formal", "white"], sizes: ["S", "M", "L", "XL"], colors: [["White", "#FFFFFF"], ["Sky Blue", "#BFDBFE"]], stock: 12,
    flags: { isFeatured: true, isTrending: true, isNewArrival: true },
  },
  {
    title: "Banarasi Silk Saree",
    description: "An elegant handwoven Banarasi saree in pure mulberry silk with gold zari work. Perfect for weddings and festive occasions.\n\nComes with an unstitched blouse piece.",
    price: 12999, compareAtPrice: 19999, category: "Sarees", gender: "WOMEN",
    images: [img("1610030469983-98e550d6193c"), img("1617627143750-d86bc21e42bb")],
    fabric: "Pure Katan Silk", fit: "Traditional drape", care: "Dry clean only.",
    tags: ["silk", "wedding", "banarasi", "festive"], sizes: ["Free Size"], colors: [["Crimson", "#DC2626"], ["Mustard", "#D97706"], ["Purple", "#7C3AED"]], stock: 4,
    flags: { isFeatured: true, isBestSeller: true, isTrending: true },
  },
  {
    title: "Slim-Fit Indigo Jeans",
    description: "Japanese denim with a hint of stretch for all-day comfort. Tailored taper, copper rivets and classic five-pocket styling.",
    price: 3499, compareAtPrice: 4999, category: "Jeans", gender: "UNISEX",
    images: [img("1542272604-787c3835535d"), img("1582552938357-32b906df40cb")],
    fabric: "98% Cotton, 2% Elastane", fit: "Slim tapered", care: "Wash inside out in cold water.",
    tags: ["denim", "jeans", "indigo"], sizes: ["30", "32", "34", "36"], colors: [["Indigo", "#1E3A8A"], ["Midnight", "#172554"]], stock: 6,
    flags: { isBestSeller: true, isTrending: true, isFlashSale: true },
  },
  {
    title: "Embroidered Anarkali Suit",
    description: "Georgette Anarkali with mirror work and golden zardozi embroidery. Includes matching dupatta and churidar.",
    price: 5999, compareAtPrice: 8999, category: "Ethnic Wear", gender: "WOMEN",
    images: [img("1608748010899-18f300247112"), img("1583391733956-3750e0ff4e8b")],
    fabric: "Georgette & Shantoon", fit: "Flared", care: "Dry clean recommended.",
    tags: ["anarkali", "ethnic", "festive", "partywear"], sizes: ["S", "M", "L", "XL"], colors: [["Rani Pink", "#BE185D"], ["Royal Purple", "#4C1D95"]], stock: 5,
    flags: { isFeatured: true, isNewArrival: true },
  },
  {
    title: "Oversized Supima Cotton T-Shirt",
    description: "Long-staple Supima cotton for exceptional softness and lasting colour. Dropped shoulder, dense rib collar and a relaxed silhouette.",
    price: 1299, compareAtPrice: 1999, category: "T-Shirts", gender: "UNISEX",
    images: [img("1521572267360-ee0c2909d518"), img("1583743814966-8936f5b7be1a")],
    fabric: "100% Supima Cotton", fit: "Oversized", care: "Machine wash cold, tumble dry low.",
    tags: ["tshirt", "basics", "cotton", "oversized"], sizes: ["S", "M", "L", "XL"], colors: [["Black", "#000000"], ["White", "#FFFFFF"], ["Grey", "#6B7280"]], stock: 20,
    flags: { isBestSeller: true, isNewArrival: true, isFlashSale: true },
  },
  {
    title: "Tailored Cotton Chinos",
    description: "Sleek chinos in fine Italian cotton twill. Flat front, buttoned welt pockets and a soft brushed finish — bridges business and leisure.",
    price: 2999, compareAtPrice: 4499, category: "Trousers", gender: "MEN",
    images: [img("1624378439575-d8705ad7ae80"), img("1479064555552-3ef4979f8908")],
    fabric: "97% Cotton, 3% Elastane", fit: "Tailored slim", care: "Machine wash cold.",
    tags: ["chinos", "trousers", "smart-casual"], sizes: ["30", "32", "34", "36"], colors: [["Tan", "#A16207"], ["Navy", "#1E293B"], ["Olive", "#4B5320"]], stock: 8,
    flags: {},
  },
  {
    title: "Kids Velvet Festive Kurta Set",
    description: "Soft velvet kurta with matching churidar and a contrast Banarasi jacket. Lined inside to keep little ones comfortable.",
    price: 2199, compareAtPrice: 3499, category: "Kids Wear", gender: "KIDS",
    images: [img("1622290291468-a28f7a7dc6a8")],
    fabric: "Velvet with cotton lining", fit: "Regular", care: "Dry clean.",
    tags: ["kids", "ethnic", "festive"], sizes: ["2-3 Y", "4-5 Y", "6-7 Y"], colors: [["Emerald", "#065F46"], ["Maroon", "#991B1B"]], stock: 2,
    flags: { isNewArrival: true },
  },
  {
    title: "Minimalist Leather Watch",
    description: "Clean analogue dial on a full-grain Italian leather strap with an extra woven steel band. Water resistant.",
    price: 4999, compareAtPrice: 7999, category: "Accessories", gender: "UNISEX",
    images: [img("1523275335684-37898b6baf30"), img("1524805444758-089113d48a6d")],
    fabric: "Leather & stainless steel", fit: "Adjustable",
    tags: ["watch", "accessories", "gift"], sizes: ["One Size"], colors: [["Tan", "#D97706"]], stock: 15,
    flags: { isFeatured: true },
  },
];

async function seedDemoCatalog() {
  if (process.env.SEED_DEMO_DATA === "false") return;
  if ((await prisma.product.count()) > 0) {
    console.log("✓ Catalog already has products — demo data not added.");
    return;
  }

  const categoryIds = new Map<string, string>();
  for (const [i, c] of CATEGORIES.entries()) {
    const cat = await prisma.category.upsert({
      where: { slug: slug(c.name) },
      create: { name: c.name, slug: slug(c.name), gender: c.gender, image: c.image, description: c.description, sortOrder: i },
      update: {},
    });
    categoryIds.set(c.name, cat.id);
  }

  for (const p of PRODUCTS) {
    const base = slug(p.title).toUpperCase().split("-").slice(0, 3).join("-");
    await prisma.product.create({
      data: {
        slug: slug(p.title),
        title: p.title,
        description: p.description,
        categoryId: categoryIds.get(p.category),
        gender: p.gender,
        price: p.price * 100,
        compareAtPrice: p.compareAtPrice ? p.compareAtPrice * 100 : null,
        images: p.images,
        fabric: p.fabric,
        fit: p.fit,
        careInstructions: p.care,
        tags: p.tags,
        ...p.flags,
        variants: {
          create: p.colors.flatMap(([color, hex], ci) =>
            p.sizes.map((size, si) => ({
              sku: `${base}-${color.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase()}-${size.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`,
              size,
              color,
              colorHex: hex,
              stock: p.stock,
              position: ci * p.sizes.length + si,
            })),
          ),
        },
      },
    });
  }

  const nextYear = new Date(Date.now() + 365 * 86_400_000);
  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", description: "10% off your first order", type: "PERCENTAGE", value: 10, maxDiscount: 50000, perUserLimit: 1, isPublic: true, expiresAt: nextYear },
      { code: "FESTIVE10", description: "Festive season — extra 10% off", type: "PERCENTAGE", value: 10, minOrderAmount: 199900, perUserLimit: 2, usageLimit: 1000, isPublic: true, expiresAt: nextYear },
      { code: "FLAT500", description: "₹500 off orders above ₹4,999", type: "FIXED", value: 50000, minOrderAmount: 499900, perUserLimit: 1, usageLimit: 200, isPublic: true, expiresAt: nextYear },
    ],
    skipDuplicates: true,
  });

  await prisma.blogPost.createMany({
    data: [
      {
        slug: "5-summer-wardrobe-essentials",
        title: "5 Summer Wardrobe Essentials",
        excerpt: "Stay cool without sacrificing style — the five pieces every warm-weather wardrobe needs.",
        content:
          "As temperatures rise, comfort becomes everything. Here are the five pieces we reach for all summer.\n\n## 1. A linen shirt\nLinen breathes better than any other fabric and only looks better with every wash.\n\n## 2. Relaxed chinos\nA lightweight cotton twill works for the office and the weekend.\n\n## 3. A quality white tee\nSupima cotton keeps its shape and colour far longer than ordinary cotton.\n\n## 4. A light kurta\nPerfect for festive evenings and family gatherings.\n\n## 5. Minimal accessories\nA leather watch and simple sandals finish every look.",
        coverImage: img("1509631179647-0177331693ae", 1400),
        tags: ["summer", "styling"],
        authorName: "Style Desk",
        readMinutes: 4,
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        slug: "the-heritage-of-banarasi-silk",
        title: "The Heritage of Banarasi Silk",
        excerpt: "How Varanasi's master weavers create the sarees that have graced Indian weddings for centuries.",
        content:
          "Banarasi silk is one of India's great textile traditions. Originating in Varanasi, these sarees are known for their gold and silver zari brocade and fine silk.\n\n## How they are made\nA single saree can take two weeks to a month on the handloom, depending on the complexity of the design.\n\n## Spotting genuine silk\nReal mulberry silk feels smooth and warm, and the reverse of a handwoven saree shows floating threads between motifs.\n\n## Caring for your saree\nAlways dry clean, store wrapped in muslin, and refold every few months to protect the zari.",
        coverImage: img("1617627143750-d86bc21e42bb", 1400),
        tags: ["heritage", "silk", "sarees"],
        authorName: "Style Desk",
        readMinutes: 6,
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 86_400_000),
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✓ Demo catalog created: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, 3 coupons, 2 articles.`);
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedDemoCatalog();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
