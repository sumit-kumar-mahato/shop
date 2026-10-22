# Prabodh Kumar Mahato — Clothing Store

A complete online clothing store with customer accounts, secure checkout, and an admin panel that lets the owner run the whole website — products, stock, orders, homepage, offers, policies and settings — **without touching code**.

Built with Next.js 14 (App Router), PostgreSQL + Prisma, Tailwind CSS, and Razorpay for online payments.

---

## What's included

### For customers
- **Accounts** — register, sign in, forgot/reset password, email verification, change password, see and sign out other devices.
- **Shopping** — search with live suggestions, filters (category, men/women/kids, size, colour, price, in stock, on sale), sorting, pagination.
- **Product pages** — image gallery with zoom, colour and size selection with **stock per size**, size guide, reviews with "verified purchase" badges, related products.
- **Bag** — works signed out (saved in the browser) and signed in (saved to the account, follows you across devices; a guest bag is merged when you sign in). Prices and stock are always checked live by the server.
- **Checkout** — saved addresses, coupon codes, Cash on Delivery and online payment (UPI / cards / net banking via Razorpay).
- **My account** — order history, live order tracking, courier tracking link, cancel an order, request a return, download a GST invoice, wishlist, address book.
- Journal (blog), Offers page, About, Contact form, Shipping/Returns/Privacy/Terms pages, newsletter sign-up, light/dark theme.

### For the store owner (`/admin`)
| Section | What you can do |
|---|---|
| **Dashboard** | Revenue, orders, average order value and new customers vs the previous 30 days; daily revenue chart; top products; low-stock alerts; orders waiting to ship. |
| **Orders** | Search & filter, change status (Confirmed → Packing → Shipped → Out for delivery → Delivered, Cancel, Return), add courier & tracking, email the customer, mark payments paid/refunded, internal notes, print invoices, export CSV. |
| **Products** | Add/edit products, upload photos from your computer (resized automatically), sizes × colours with separate stock and SKU for each, sale price, draft/publish/archive, homepage placement. |
| **Categories** | Create, edit, reorder, hide; cover images. |
| **Customers** | Order history & spend per customer, disable accounts, make someone Staff or Administrator. |
| **Coupons** | Percentage or fixed discounts, minimum order, maximum discount, start/end dates, total and per-customer limits, show on the Offers page. |
| **Reviews** | Approve or reject reviews before they appear. |
| **Messages** | Contact-form inbox and newsletter subscribers (CSV download). |
| **Homepage** | Show/hide and reorder sections; edit hero banners, service highlights, promo banner, flash-sale countdown, brand story, newsletter text. |
| **About & policies** | Edit the About page and all policy pages. |
| **Journal** | Write and publish articles. |
| **Store settings** *(admins only)* | Store name, logo text, brand colour, contact details, GSTIN, announcement bar, social links, shipping fee & free-shipping amount, GST rate (inclusive/exclusive), COD on/off and limit, online payments on/off, return window, low-stock level, new-order alert email, SEO. |
| **Activity log** *(admins only)* | Every admin change, who made it and when. |

**Staff** accounts can do everything except Store settings, the Activity log and changing roles.

---

## Security

- Passwords hashed with bcrypt; sessions are signed tokens backed by a database record, so signing out, changing a password or disabling an account takes effect immediately.
- Every admin API checks the signed-in user's role on the server.
- Orders are priced on the server from the database. Stock is reserved inside a database transaction, so the last item can't be sold twice and stock never goes negative. Coupon limits are enforced the same way.
- Online payments are confirmed by verifying Razorpay's signature (and the optional webhook). Card details never touch this server.
- Customers can only see their own orders, invoices and addresses.
- Rate limiting on sign-in (per IP and per account), registration, password reset, checkout, reviews and contact forms.
- Cross-site request protection, strict security headers (CSP, HSTS, frame blocking), validated input everywhere, and admin-editable links restricted to safe URLs.
- Uploaded images are checked by their content (SVG is blocked).

---

## Run it on your computer

**You need:** Node.js 20+ and Docker Desktop.

```bash
cp .env.example .env          # then edit .env — at least AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up -d db       # starts PostgreSQL
npm install
npm run db:migrate            # creates the tables
npm run db:seed               # creates your admin account, default settings and demo products
npm run dev                   # http://localhost:3000
```

Sign in at **http://localhost:3000/login** with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then open **/admin**. Change the password afterwards from **Account → Security**.

Generate an `AUTH_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**One-click on Windows:** right-click `run-shop.ps1` → *Run with PowerShell*. On first run it asks for your admin email/password, creates `.env`, and starts the whole store in Docker.

> **Behind a company proxy?** If `npm install` fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, run it as `NODE_USE_SYSTEM_CA=1 npm install` so Node trusts the Windows certificate store.

### Useful commands
| Command | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build && npm start` | Production build and server |
| `npm test` | Unit tests (pricing, discounts, shipping, GST) |
| `npm run typecheck` / `npm run lint` | Static checks |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Create admin + defaults (safe to run again — never overwrites your data) |
| `npm run db:studio` | Browse the database in your browser |

---

## Deploy (Vercel + Supabase)

1. **Supabase** → create a project → *Project Settings → Database → Connection string*:
   - `DATABASE_URL` = the **Transaction pooler** URL (port `6543`) with `?pgbouncer=true` added.
   - `DIRECT_URL` = the **Session / direct** URL (port `5432`). Used only for migrations.
2. **Vercel** → import the GitHub repo → *Settings → Environment Variables* → add everything from `.env.example`:
   `DATABASE_URL`, `DIRECT_URL`, `APP_URL` (your site address), `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally the Razorpay and SMTP values.
3. Deploy. The `vercel-build` script automatically applies migrations, creates your admin account (first deploy only) and builds the site.

> **Upgrading from the previous version:** the database design has changed completely (per-size stock, user accounts, order items, etc.), so use a **new, empty database** (a new Supabase project, or reset the old one). The old demo data is recreated by the seed. If you have real orders in the old database you want to keep, export them first.

### Online payments (Razorpay)
1. Create keys at <https://dashboard.razorpay.com/app/keys> and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. *(Recommended)* Add a webhook at **Razorpay Dashboard → Webhooks**: URL `https://<your-site>/api/payments/razorpay/webhook`, events `payment.captured`, `order.paid`, `payment.failed`; put its secret in `RAZORPAY_WEBHOOK_SECRET`. This confirms payments even if the customer closes the browser right after paying.
3. Turn on *Accept online payments* in **Admin → Store settings**.

Online orders that aren't paid within 30 minutes are cancelled automatically and their stock is released. Refunds are issued from the Razorpay dashboard; then mark the payment as *Refunded* on the order.

### Email
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` and `MAIL_FROM` (any provider — Gmail with an app password, Zoho, Brevo, Amazon SES…). Without SMTP, emails (order confirmations, password resets, shipping updates) are printed in the server log instead of being sent — so set it up before going live.

---

## Project structure

```
prisma/
  schema.prisma          Database tables
  migrations/            SQL migrations (applied with `npm run db:migrate`)
  seed.ts                Admin account, default settings, demo catalog
src/
  app/(store)/           Customer pages: home, shop, product, cart, checkout, account, auth, blog, policies…
  app/admin/             Admin panel pages
  app/api/               JSON API (auth, cart, checkout, payments, admin/*)
  app/invoice/           Printable GST invoice
  components/store/      Storefront components
  components/admin/      Admin components and editors
  components/ui/         Buttons, form fields, modal, toasts
  lib/                   Server logic: auth, orders, pricing, cart, catalog, settings, mail, Razorpay
  middleware.ts          First-line route protection for /admin, /account, /checkout
legacy-src/              The previous version's code, kept for reference — safe to delete
```

Money is stored in **paise** (₹1 = 100) as whole numbers to avoid rounding errors.
