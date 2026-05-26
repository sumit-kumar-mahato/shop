# Prabodh Kumar Mahato Clothing Storefront & Visual CMS

An enterprise-grade, luxury-designed fashion storefront and integrated visual admin CMS. Designed specifically for clothing retail business owners to visually manage catalog inventories, banner advertisements, homepage order structures, coupons, client details, and order invoices **without writing any code**.

---

## 💎 Design Philosophy & Aesthetic Details
- **Luxury Branding:** Styled with an elegant dark/light theme, custom Outfit & Serif typography (Playfair Display), premium card layouts, and subtle transition micro-interactions.
- **Mobile-First Responsive:** Crafted for mobile screens, tablets, and desktops.
- **Conversion-Optimized Checkout:** Fast 2-step checkout with multiple simulated payment options (Razorpay/Stripe card forms, instant UPI QR-code scan, Cash on Delivery COD).
- **Interactive Celebration:** Utilizes canvas confetti bursts when client orders are completed.

---

## 🛠️ Technology Stack
- **Frontend / Storefront:** Next.js (App Router, Server-side Rendering + Client interactivity), React, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Database Engine:** PostgreSQL (Cloud persistent database via Supabase connection pooler).
- **ORM / Schema Tool:** Prisma Client.
- **Deployment & Sandbox:** Docker Containerization via `docker-compose`.

---

## 📂 Production Folder Structure
```
C:\Users\Lenovo\Desktop\SHOP\
├── prisma/
│   ├── schema.prisma      # Prisma PostgreSQL model structures (Product, Order, Category, Blog, Coupon, CMSConfig)
│   └── seed.ts            # High-quality dummy clothing catalog items (French linens, sarees, chinos, velvet sets)
├── src/
│   ├── app/
│   │   ├── layout.tsx     # Inject fonts, header/footer navigation structures, custom CSS variable styles
│   │   ├── page.tsx       # Dynamic home page rendering modular sections based on visual CMS settings
│   │   ├── shop/          # Boutique search catalog supporting filters (gender, size, price, colors, fabric)
│   │   ├── product/[id]/  # Garment details page with image hover-zoom, size guides, and approved client reviews
│   │   ├── cart/          # Cart overview + apparel 12% GST breakdown + free shipping estimator
│   │   ├── checkout/      # Multi-step checkout with mock payments, stock inventory decrements, and invoice printer
│   │   ├── wishlist/      # Wishlist saved apparel grid
│   │   ├── profile/       # Client Dashboard tracking logistics (Placed -> Shipped -> Delivered) + Reward points
│   │   ├── blog/          # Fashion journal articles
│   │   ├── offers/        # Active discount coupon cards with click-to-copy code scripts
│   │   ├── policy/        # Shipping, refund, and legal policies tabbed panel
│   │   ├── admin/         # Integrated Shopify-like visual admin CMS panel
│   │   │   ├── page.tsx   # Dashboard charts (contribution percentages) + low stock notification warnings
│   │   │   ├── products/  # Visual CRUD Product Editor with quick Unsplash preloaded templates
│   │   │   ├── categories/# Category organizer
│   │   │   ├── orders/    # Order transaction invoice log + visual shipping status toggle
│   │   │   ├── content/   # Reorder homepage sections visually, update carousel banners
│   │   │   └── settings/  # Edit primary colors, store hotlines, and SEO meta tags
│   │   └── api/           # Node.js API REST routes for database updates
│   ├── components/
│   │   ├── CartContext.tsx# Shared state provider syncing cart items locally
│   │   └── WishlistContext.tsx # Wishlist state provider
│   └── lib/
│       └── db.ts          # Shared database connector
├── Dockerfile             # Alpine compiler configuration
├── docker-compose.yml     # Mapping ports and databases
├── run-shop.ps1           # Windows double-clickable automation script
└── README.md              # Documentation
```

---

## ⚡ How to Start (No-Code User Friendly)

You do **NOT** need Node.js or NPM installed locally. Everything is packaged inside Docker.

### Running on Windows:
1. Make sure **Docker Desktop** is running (check for green indicator in taskbar).
2. Right-click on the `run-shop.ps1` script and select **Run with PowerShell** (or simply double-click).
3. The script will:
   - Verify Docker availability.
   - Build and compile the Next.js storefront image.
   - Seed the database with high-quality clothes, blogs, and banner configurations.
   - Expose port `3000`.
   - Automatically launch your browser at:
     - **Storefront:** [http://localhost:3000](http://localhost:3000)
     - **Admin CMS:** [http://localhost:3000/admin](http://localhost:3000/admin)

### Manual Docker Commands (Alternative):
If you prefer standard terminals, execute the following from `C:\Users\Lenovo\Desktop\SHOP`:
```bash
# Build and run storefront
docker compose up -d --build

# Shutdown server
docker compose down
```

---

## ⚙️ Cloud Deployment (Vercel & Supabase)
This project is fully ready for zero-downtime, 100% free cloud deployment:
1. Pushed to your personal GitHub repository.
2. Connected to a **Supabase PostgreSQL** database using the connection pooler.
3. Deployed on **Vercel** with automatic schema creation, table migrations, and catalog seeding during build time.
