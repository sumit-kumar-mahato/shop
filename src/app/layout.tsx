import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, DM_Serif_Display, Inter, Jost, Marcellus, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth/session";
import type { ThemeSettings } from "@/lib/settings-schema";
import { contrastTextTriplet, hexToRgbTriplet } from "@/lib/utils";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

// Every font the admin can choose from (Appearance → Typography). Only the ones actually used
// on a page are downloaded by the browser; the defaults are preloaded.
const inter = Inter({ subsets: ["latin"], variable: "--f-inter", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--f-dm-sans", display: "swap", preload: false });
const jost = Jost({ subsets: ["latin"], variable: "--f-jost", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], variable: "--f-outfit", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--f-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-cormorant", display: "swap", preload: false });
const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--f-dm-serif", display: "swap", preload: false });
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--f-marcellus", display: "swap", preload: false });
const fontClasses = [inter, dmSans, jost, outfit, playfair, cormorant, dmSerif, marcellus].map((f) => f.variable).join(" ");

const RADIUS: Record<ThemeSettings["corners"], string> = { sharp: "0.125rem", soft: "0.5rem", rounded: "1rem" };
const BUTTON_RADIUS: Record<ThemeSettings["buttons"], string> = { pill: "9999px", rounded: "0.625rem", square: "0.125rem" };

export async function generateMetadata(): Promise<Metadata> {
  const [store, theme] = await Promise.all([getSettings("store"), getSettings("theme")]);
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(appUrl),
    title: { default: store.seo.title, template: `%s | ${store.storeName}` },
    description: store.seo.description,
    applicationName: store.storeName,
    openGraph: { type: "website", siteName: store.storeName, title: store.seo.title, description: store.seo.description, locale: "en_IN" },
    twitter: { card: "summary_large_image" },
    icons: { icon: theme.favicon || "/favicon.ico" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// Applies the light/dark mode before first paint to avoid a flash: the visitor's saved choice (when
// the store allows switching), otherwise the store default. The admin panel always honours the saved choice.
// Also marks that JavaScript is running, which enables scroll-reveal animations.
function themeScript(theme: ThemeSettings) {
  const cfg = JSON.stringify({ mode: theme.colorMode, toggle: theme.allowThemeToggle });
  return `(function(){var c=${cfg},d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("theme");if(!c.toggle&&location.pathname.indexOf("/admin")!==0)t=null;var dark=t?t==="dark":c.mode==="dark"||(c.mode==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(dark)d.classList.add("dark")}catch(e){}})()`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, user] = await Promise.all([getSettings("theme"), getCurrentUser()]);
  const vars = [
    `--brand-rgb:${hexToRgbTriplet(theme.primaryColor)}`,
    `--brand-fg-rgb:${contrastTextTriplet(theme.primaryColor)}`,
    `--font-sans:var(--f-${theme.bodyFont})`,
    `--font-serif:var(--f-${theme.headingFont})`,
    `--font-display:var(--f-${theme.logoFont})`,
    `--radius-sm:${RADIUS[theme.corners]}`,
    `--radius-btn:${BUTTON_RADIUS[theme.buttons]}`,
  ].join(";");

  return (
    <html lang="en-IN" className={`${fontClasses}${theme.animations ? "" : " no-motion"}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript(theme) }} />
        <style dangerouslySetInnerHTML={{ __html: `:root{${vars}}` }} />
      </head>
      <body className="min-h-screen font-sans">
        <SessionProvider
          user={user ? { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified } : null}
        >
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
