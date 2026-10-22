import React from "react";
import { prisma } from "@/lib/db";
import AdminSettingsClient from "@/components/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let cmsConfig = null;
  try {
    const configRecord = await prisma.cmsConfig.findUnique({
      where: { key: "store_settings" },
    });
    if (configRecord) {
      cmsConfig = JSON.parse(configRecord.value);
    }
  } catch (e) {
    console.error("Settings loader error", e);
  }

  // Fallback defaults
  const defaultSettings = {
    storeName: "PRABODH KUMAR MAHATO CLOTHING",
    logoText: "PRABODH KUMAR MAHATO",
    primaryColor: "#c5a880",
    secondaryColor: "#111827",
    contactPhone: "+91 98765 43210",
    contactEmail: "contact@prabodhclothing.com",
    address: "Chowka, Jharkhand, Pincode-832404",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    seoTitle: "Prabodh Kumar Mahato | Luxury Clothing Storefront",
    seoDescription: "Premium clothing store featuring French linens, Banarasi sarees, and designer apparel.",
    banners: [],
    sectionsOrder: ["hero-slider", "featured-categories", "new-arrivals"],
    promoHighlight: null,
  };

  const finalSettings = cmsConfig || defaultSettings;

  return <AdminSettingsClient initialSettings={finalSettings} />;
}
