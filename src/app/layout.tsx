import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth/session";
import { contrastTextTriplet, hexToRgbTriplet } from "@/lib/utils";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const store = await getSettings("store");
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(appUrl),
    title: { default: store.seo.title, template: `%s | ${store.storeName}` },
    description: store.seo.description,
    applicationName: store.storeName,
    openGraph: { type: "website", siteName: store.storeName, title: store.seo.title, description: store.seo.description, locale: "en_IN" },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/favicon.ico" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

// Applies the saved light/dark preference before first paint to avoid a flash.
// Also marks that JavaScript is running, which enables scroll-reveal animations.
const themeScript = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [store, user] = await Promise.all([getSettings("store"), getCurrentUser()]);
  const brandVars = `:root{--brand-rgb:${hexToRgbTriplet(store.primaryColor)};--brand-fg-rgb:${contrastTextTriplet(store.primaryColor)}}`;

  return (
    <html lang="en-IN" className={`${inter.variable} ${outfit.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <style dangerouslySetInnerHTML={{ __html: brandVars }} />
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
