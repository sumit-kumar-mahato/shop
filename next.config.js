/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Content-Security-Policy. Razorpay Checkout needs its script, frame and API hosts; the homepage
// video block embeds YouTube (privacy-enhanced domain). The site may frame itself for the admin live preview.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://checkout.razorpay.com https://*.razorpay.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.razorpay.com",
  "frame-src 'self' https://*.razorpay.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

// Old web addresses (comma-separated hosts) whose pages permanently redirect to APP_URL, so search
// engines index a single address. API routes are not redirected, so payment webhooks set up with an
// old address keep working.
const appHost = (() => {
  try {
    return new URL(process.env.APP_URL || "").host;
  } catch {
    return "";
  }
})();
const legacyHosts = (process.env.LEGACY_HOSTS || "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter((h) => h && h !== appHost);

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
    // Uploaded images are resized in the browser before upload and served from /api/images,
    // so the Next image optimizer is not needed (and would otherwise act as an open proxy).
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/profile", destination: "/account", permanent: true },
      { source: "/wishlist", destination: "/account/wishlist", permanent: true },
      { source: "/admin/login", destination: "/login?next=/admin", permanent: false },
      { source: "/admin/content", destination: "/admin/homepage", permanent: true },
      { source: "/policy", destination: "/policies/shipping", permanent: true },
      ...legacyHosts.map((host) => ({
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: host }],
        destination: `https://${appHost}/:path`,
        permanent: true,
      })),
    ];
  },
};

module.exports = nextConfig;
