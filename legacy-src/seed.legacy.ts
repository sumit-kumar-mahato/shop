import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking if database is already seeded...");
  
  // Check if database is already initialized with CMS Config
  const cmsCount = await prisma.cmsConfig.count();
  if (cmsCount > 0) {
    console.log("Database already contains data. Skipping seed to prevent overwriting custom products and orders.");
    return;
  }

  console.log("Seeding started...");

  // 2. Seed Categories
  const categories = [
    { name: "Shirts", slug: "shirts", gender: "Men", image: "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=80" },
    { name: "Pants", slug: "pants", gender: "Men", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80" },
    { name: "Jeans", slug: "jeans", gender: "Unisex", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80" },
    { name: "T-Shirts", slug: "t-shirts", gender: "Unisex", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80" },
    { name: "Sarees", slug: "sarees", gender: "Women", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80" },
    { name: "Undergarments", slug: "undergarments", gender: "Unisex", image: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop&q=80" },
    { name: "Ethnic Wear", slug: "ethnic-wear", gender: "Women", image: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=80" },
    { name: "Kids Wear", slug: "kids-wear", gender: "Kids", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80" },
    { name: "Women’s Fashion", slug: "womens-fashion", gender: "Women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80" },
    { name: "Men’s Fashion", slug: "mens-fashion", gender: "Men", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80" },
    { name: "Seasonal Collections", slug: "seasonal", gender: "All", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80" },
    { name: "Accessories", slug: "accessories", gender: "All", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" }
  ];

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log("Categories seeded.");

  // 3. Seed Products
  const products = [
    {
      title: "Classic White Premium Linen Shirt",
      description: "Crafted from 100% fine French linen, this premium white shirt is breathable, light, and perfectly suited for smart-casual wear. It features a modern slim fit, point collar, and single-cuff detail.",
      price: 2499,
      compareAtPrice: 3999,
      sku: "MS-LIN-WH-001",
      stock: 45,
      gender: "Men",
      categoryName: "Shirts",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#FFFFFF", "#E5E7EB"]),
      sizes: JSON.stringify(["M", "L", "XL"]),
      fabric: "100% Linen",
      fit: "Slim Fit",
      tags: JSON.stringify(["classic", "linen", "formal", "men"]),
      rating: 4.8,
      isFeatured: true,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: false,
      isFlashSale: false,
      discountPercentage: 37
    },
    {
      title: "Luxury Silk Banarasi Saree",
      description: "An elegant, traditional handwoven Banarasi Saree made of pure Mulberry silk and gold zari threads. Perfect for weddings, celebrations, and festive occasions. Comes with an unstitched blouse piece.",
      price: 12999,
      compareAtPrice: 19999,
      sku: "WS-BAN-SLK-002",
      stock: 12,
      gender: "Women",
      categoryName: "Sarees",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#DC2626", "#D97706", "#7C3AED"]),
      sizes: JSON.stringify(["Free Size"]),
      fabric: "Pure Katan Silk",
      fit: "Traditional Draped",
      tags: JSON.stringify(["wedding", "silk", "ethnic", "women"]),
      rating: 4.9,
      isFeatured: true,
      isTrending: true,
      isNewArrival: false,
      isBestSeller: true,
      isFlashSale: false,
      discountPercentage: 35
    },
    {
      title: "Premium Slim-Fit Indigo Jeans",
      description: "Made from superior Japanese raw denim with a hint of stretch, these indigo jeans offer incredible comfort and durability. Featuring a tailored taper, copper rivets, and a classic 5-pocket construction.",
      price: 3499,
      compareAtPrice: 4999,
      sku: "UN-DEN-IND-003",
      stock: 8, // Low stock for test alert
      gender: "Unisex",
      categoryName: "Jeans",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#1E3A8A", "#172554"]),
      sizes: JSON.stringify(["30", "32", "34", "36"]),
      fabric: "98% Cotton Denim, 2% Elastane",
      fit: "Slim Tapered",
      tags: JSON.stringify(["denim", "indigo", "raw", "unisex"]),
      rating: 4.6,
      isFeatured: false,
      isTrending: true,
      isNewArrival: false,
      isBestSeller: true,
      isFlashSale: false,
      discountPercentage: 30
    },
    {
      title: "Luxury Embroidered Anarkali Suit",
      description: "Make a statement with this premium Georgette Anarkali Suit adorned with exquisite mirror work and golden Zardozi embroidery. Styled with a matching dupatta and churidar pants.",
      price: 5999,
      compareAtPrice: 8999,
      sku: "WS-ANA-GEO-004",
      stock: 22,
      gender: "Women",
      categoryName: "Ethnic Wear",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#BE185D", "#4C1D95"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      fabric: "Pure Georgette & Shantoon",
      fit: "Flared Anarkali",
      tags: JSON.stringify(["ethnic", "anarkali", "partywear", "women"]),
      rating: 4.7,
      isFeatured: true,
      isTrending: false,
      isNewArrival: true,
      isBestSeller: false,
      isFlashSale: false,
      discountPercentage: 33
    },
    {
      title: "Casual Oversized Supima T-Shirt",
      description: "Engineered from long-staple Supima cotton for unmatched softness, luxury weight, and lasting color retention. Features a dropped shoulder, dense rib collar, and relaxed street-smart silhouette.",
      price: 1299,
      compareAtPrice: 1999,
      sku: "UN-TEE-SUP-005",
      stock: 120,
      gender: "Unisex",
      categoryName: "T-Shirts",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#000000", "#FFFFFF", "#6B7280"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      fabric: "100% Supima Cotton",
      fit: "Oversized Fit",
      tags: JSON.stringify(["supima", "tshirt", "oversized", "basics"]),
      rating: 4.5,
      isFeatured: false,
      isTrending: true,
      isNewArrival: true,
      isBestSeller: true,
      isFlashSale: true,
      discountPercentage: 35
    },
    {
      title: "Tailored Premium Chino Trousers",
      description: "Sleek, modern chinos cut from fine Italian cotton twill. Features a flat front design, buttoned welt pockets, and a soft brushed finish. Ideal to bridge the gap between business and leisure.",
      price: 2999,
      compareAtPrice: 4499,
      sku: "MS-CHI-TWL-006",
      stock: 35,
      gender: "Men",
      categoryName: "Pants",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#78350F", "#1E293B", "#4B5563"]),
      sizes: JSON.stringify(["30", "32", "34", "36"]),
      fabric: "97% Brushed Cotton, 3% Elastane",
      fit: "Tailored Slim",
      tags: JSON.stringify(["chinos", "pants", "tailored", "smart-casual"]),
      rating: 4.7,
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: false,
      isFlashSale: false,
      discountPercentage: 33
    },
    {
      title: "Kids Velvet Festive Kurta Set",
      description: "Make your little one shine in this ultra-soft designer velvet Kurta set with matching churidar pants and a contrast banarasi jacket. Extremely soft inside lining to avoid skin irritation.",
      price: 2199,
      compareAtPrice: 3499,
      sku: "KD-KUR-VEL-007",
      stock: 3, // Low stock for test alert
      gender: "Kids",
      categoryName: "Kids Wear",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#065F46", "#991B1B"]),
      sizes: JSON.stringify(["2-3 Y", "4-5 Y", "6-7 Y"]),
      fabric: "Silk Velvet & Cotton Inner",
      fit: "Kids Standard",
      tags: JSON.stringify(["kids", "ethnic", "velvet", "festive"]),
      rating: 4.8,
      isFeatured: false,
      isTrending: false,
      isNewArrival: true,
      isBestSeller: false,
      isFlashSale: false,
      discountPercentage: 37
    },
    {
      title: "Minimalist Leather Smart Watch & Strap Set",
      description: "A premium leather-strapped analogue watch combined with interchangeable woven metal bands. Features clean geometric details, scratching protection, and water resistance.",
      price: 4999,
      compareAtPrice: 7999,
      sku: "AC-WAT-LTH-008",
      stock: 50,
      gender: "Unisex",
      categoryName: "Accessories",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
      ]),
      colors: JSON.stringify(["#D97706", "#111827"]),
      sizes: JSON.stringify(["One Size"]),
      fabric: "Full-Grain Italian Leather & Steel",
      fit: "Adjustable",
      tags: JSON.stringify(["watch", "accessories", "leather", "unisex"]),
      rating: 4.4,
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: false,
      isFlashSale: false,
      discountPercentage: 37
    }
  ];

  for (const prod of products) {
    const createdProduct = await prisma.product.create({ data: prod });
    
    // Seed some reviews for each product
    await prisma.review.create({
      data: {
        customerName: "Aarav Sharma",
        customerEmail: "aarav@example.com",
        rating: 5,
        comment: `Excellent quality! The fabric feels premium and the fit is absolutely perfect. Worth every rupee.`,
        approved: true,
        productId: createdProduct.id
      }
    });

    await prisma.review.create({
      data: {
        customerName: "Priya Patel",
        customerEmail: "priya@example.com",
        rating: 4,
        comment: `Very stylish. The color is exactly as pictured. Shipping took 3 days to Mumbai.`,
        approved: true,
        productId: createdProduct.id
      }
    });
  }
  console.log("Products and reviews seeded.");

  // 4. Seed Coupons
  const coupons = [
    { code: "FASHION20", discountType: "PERCENTAGE", value: 20, expiryDate: new Date("2027-12-31"), active: true, usageLimit: 500 },
    { code: "FESTIVE10", discountType: "PERCENTAGE", value: 10, expiryDate: new Date("2027-12-31"), active: true, usageLimit: 1000 },
    { code: "FLAT1000", discountType: "FIXED", value: 1000, expiryDate: new Date("2027-12-31"), active: true, usageLimit: 100 }
  ];

  for (const coup of coupons) {
    await prisma.coupon.create({ data: coup });
  }
  console.log("Coupons seeded.");

  // 5. Seed Blogs
  const blogs = [
    {
      title: "5 Summer Wardrobe Essentials for the Modern Wardrobe",
      content: "As temperatures rise, transitioning your wardrobe to prioritize comfort without sacrificing style becomes crucial. This guide covers the five pieces every modern closet needs: starting with breathable French linen shirts, lightweight Indigo cotton jeans, raw-edge neutral tone Supima tees, tailored chinos, and easy-slide premium footwear. We explore how to mix and match colors, materials, and fits to maintain an elegant silhouette in the hottest months.",
      coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
      tags: JSON.stringify(["summer", "styling", "trends"]),
      author: "Radhika Sen",
      readTime: "4 min read"
    },
    {
      title: "The Heritage Art of Banarasi Silk: A Weaver's Legacy",
      content: "Banarasi silk stands as a hallmark of Indian textile heritage. Originating from the holy city of Varanasi, these sarees are renowned for their gold and silver brocade (Zari), fine silk, and opulent embroidery. In this article, we dive deep into the multi-week handloom weaving process, explain how to distinguish genuine Mulberry silk from synthetic blends, and share modern draping patterns that preserve traditional elegance with a contemporary edge.",
      coverImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80",
      tags: JSON.stringify(["ethnic", "banarasi", "heritage"]),
      author: "Amit Kumar",
      readTime: "7 min read"
    }
  ];

  for (const b of blogs) {
    await prisma.blog.create({ data: b });
  }
  console.log("Blogs seeded.");

  // 6. Seed CMS Configuration (Page layouts, banners, settings)
  const defaultCmsValue = {
    storeName: "PRABODH KUMAR MAHATO CLOTHING",
    logoText: "PRABODH KUMAR MAHATO",
    primaryColor: "#c5a880", // Premium Gold
    secondaryColor: "#111827", // Dark Slate
    contactPhone: "+91 98765 43210",
    contactEmail: "contact@prabodhclothing.com",
    address: "Chowka, Jharkhand, Pincode-832404",
    seoTitle: "Prabodh Kumar Mahato | Luxury Clothing Storefront",
    seoDescription: "Premium clothing store featuring fine French linens, banarasi silk sarees, tailored trousers and ethnic styles. Fast delivery in Jharkhand & worldwide.",
    banners: [
      {
        id: "banner-1",
        title: "THE SUMMER COUTURE",
        subtitle: "Linen, Silk & Breathable Luxury Tailoring",
        description: "Explore our latest seasonal collections crafted with ultra-breathable materials and pristine geometries.",
        buttonText: "DISCOVER COLLECTION",
        link: "/shop",
        image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1600&auto=format&fit=crop&q=80"
      },
      {
        id: "banner-2",
        title: "HERITAGE ETHNIC WEAR",
        subtitle: "Handwoven Silk Sarees & Embroidered Kurtas",
        description: "Zardozi hand-embroidery and authentic Banarasi silks designed for timeless celebrations.",
        buttonText: "SHOP ETHNIC",
        link: "/shop?gender=Women",
        image: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=1600&auto=format&fit=crop&q=80"
      }
    ],
    sectionsOrder: [
      "hero-slider",
      "featured-categories",
      "new-arrivals",
      "promo-highlights",
      "best-sellers",
      "brand-story",
      "reviews-testimonials",
      "instagram-showcase"
    ],
    promoHighlight: {
      title: "EXCLUSIVE FESTIVE OFFERS",
      subtitle: "Get up to 35% off on our handwoven Banarasi Sarees and Premium Suits",
      buttonText: "UNLOCK OFFERS",
      link: "/offers",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80"
    }
  };

  await prisma.cmsConfig.create({
    data: {
      key: "store_settings",
      value: JSON.stringify(defaultCmsValue)
    }
  });

  console.log("CMS Configurations seeded.");
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
