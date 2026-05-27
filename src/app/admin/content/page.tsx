import React from "react";
import { prisma } from "@/lib/db";
import AdminContentClient from "@/components/AdminContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  let cmsConfig = null;
  try {
    const configRecord = await prisma.cmsConfig.findUnique({
      where: { key: "store_settings" },
    });
    if (configRecord) {
      cmsConfig = JSON.parse(configRecord.value);
    }
  } catch (e) {
    console.error("CMS loader error", e);
  }

  // Fallback defaults if configuration is empty
  const defaultCmsConfig = {
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
    promoHighlight: {
      title: "PROMOTION",
      subtitle: "Description",
      buttonText: "UNLOCK",
      link: "/shop",
      image: "",
    },
    flashSaleBadge: "FLASH SALE RUNNING",
    flashSaleTitle: "Mid-Season Clearance",
    flashSaleSubtitle: "Get premium Supima cotton tees, raw denim, and linen suits at limited-time discount rates. Free delivery applies.",
    flashSaleHours: 18,
  };

  const finalConfig = cmsConfig || defaultCmsConfig;

  return <AdminContentClient initialConfig={finalConfig} />;
}
