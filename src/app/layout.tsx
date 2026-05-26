import React from "react";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import { prisma } from "@/lib/db";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
});

export async function generateMetadata(): Promise<Metadata> {
  let title = "Prabodh Kumar Mahato | Luxury Clothing Storefront";
  let description = "Premium clothing store featuring French linens, Banarasi sarees, and designer apparel.";

  try {
    const configRecord = await prisma.cmsConfig.findUnique({
      where: { key: "store_settings" },
    });
    if (configRecord) {
      const settings = JSON.parse(configRecord.value);
      title = settings.seoTitle || title;
      description = settings.seoDescription || description;
    }
  } catch (e) {
    // Graceful fallback if database is not migrated/seeded yet
  }

  return {
    title,
    description,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = {
    primaryColor: "#c5a880",
    secondaryColor: "#111827",
    storeName: "PRABODH KUMAR MAHATO CLOTHING",
    logoText: "PRABODH KUMAR MAHATO",
    contactEmail: "contact@prabodhclothing.com",
    contactPhone: "+91 98765 43210",
    address: "Chowka, Jharkhand, Pincode-832404",
  };

  try {
    const configRecord = await prisma.cmsConfig.findUnique({
      where: { key: "store_settings" },
    });
    if (configRecord) {
      settings = JSON.parse(configRecord.value);
    }
  } catch (e) {
    // Graceful fallback
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const savedTheme = localStorage.getItem("theme");
              if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
                document.documentElement.classList.add("dark");
              } else {
                document.documentElement.classList.remove("dark");
              }
            })();
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary-color: ${settings.primaryColor};
              --secondary-color: ${settings.secondaryColor};
            }
          `
        }} />
        {/* Playfair Display font for Serif luxury headers */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-luxury-50 text-luxury-900 dark:bg-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col transition-colors duration-300`}>
        <CartProvider>
          <WishlistProvider>
            <Navbar logoText={settings.logoText} contactEmail={settings.contactEmail} />
            <main className="flex-grow pt-20">{children}</main>
            <Footer
              storeName={settings.storeName}
              contactEmail={settings.contactEmail}
              contactPhone={settings.contactPhone}
              address={settings.address}
            />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
