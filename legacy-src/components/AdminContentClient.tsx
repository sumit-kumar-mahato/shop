"use client";

import React, { useState } from "react";
import { Palette, ArrowUp, ArrowDown, Sparkles, Save, HelpCircle, X, Plus } from "lucide-react";
import confetti from "canvas-confetti";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  link: string;
  image: string;
}

interface AdminContentClientProps {
  initialConfig: {
    storeName: string;
    logoText: string;
    primaryColor: string;
    secondaryColor: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    seoTitle: string;
    seoDescription: string;
    banners: Banner[];
    sectionsOrder: string[];
    promoHighlight: {
      title: string;
      subtitle: string;
      buttonText: string;
      link: string;
      image: string;
    };
  };
}

export default function AdminContentClient({ initialConfig }: AdminContentClientProps) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);

  const handlePromoChange = (field: string, val: string) => {
    setConfig((prev) => ({
      ...prev,
      promoHighlight: {
        ...prev.promoHighlight,
        [field]: val
      }
    }));
  };

  const handleConfigChange = (key: string, val: string) => {
    setConfig((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddBanner = () => {
    const newBanner = {
      id: `slide_${Date.now()}`,
      title: "NEW ARRIVALS",
      subtitle: "EXQUISITE COUTURE",
      description: "Discover our latest curated line of French linen shirts, silk sarees, and high-end apparel designed for the modern wardrobe.",
      buttonText: "DISCOVER NOW",
      link: "/shop",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
    };
    setConfig((prev) => ({
      ...prev,
      banners: [...(prev.banners || []), newBanner],
    }));
  };

  const handleDeleteBanner = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      banners: (prev.banners || []).filter((_, i) => i !== index),
    }));
  };

  // Section human-readable labels
  const sectionLabels: Record<string, string> = {
    "hero-slider": "Hero Image Carousel Banner",
    "services-bar": "Value Badges Bar (Free Delivery, Returns)",
    "featured-categories": "Categories Showcase Grid",
    "new-arrivals": "New Arrivals Product Carousel",
    "promo-highlights": "Promo Highlights Highlight Banner",
    "best-sellers": "Client Favorites Grid",
    "flash-sale": "Flash Clearance countdown box",
    "brand-story": "Brand Philosophy story card",
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...config.sectionsOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setConfig((prev) => ({ ...prev, sectionsOrder: newOrder }));
  };

  const handleBannerChange = (index: number, field: keyof Banner, val: string) => {
    const updatedBanners = config.banners.map((b, i) => (i === index ? { ...b, [field]: val } : b));
    setConfig((prev) => ({ ...prev, banners: updatedBanners }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        confetti({
          particleCount: 80,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#c5a880", "#ffffff"],
        });
      } else {
        alert("Failed to save changes.");
      }
    } catch (e) {
      alert("Error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-zinc-800 dark:text-zinc-100">
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Homepage & CMS Editor</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Drag-and-drop or reorder section modules visually.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold text-xs tracking-wider py-3 px-6 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
        >
          <Save size={16} /> {saving ? "SAVING CMS..." : "SAVE WEBSITE CHANGES"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module Order Rearranger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
              <Palette size={15} className="text-luxury-gold" /> Section Layout Order
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              Rearrange the home page sections using the Up/Down keys. Edits update live on the storefront.
            </p>

            <div className="space-y-2">
              {config.sectionsOrder.map((sectionId, idx) => (
                <div
                  key={sectionId}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded flex justify-between items-center text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span className="font-semibold uppercase truncate w-40 text-zinc-800 dark:text-zinc-200">
                    {sectionLabels[sectionId] || sectionId}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded hover:text-luxury-gold dark:hover:text-luxury-gold text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === config.sectionsOrder.length - 1}
                      className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded hover:text-luxury-gold dark:hover:text-luxury-gold text-zinc-600 dark:text-zinc-300 disabled:opacity-40"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Carousel Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-sm">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Carousel Slides ({config.banners?.length || 0})</h2>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Manage your home page hero advertisement slider.</p>
            </div>
            <button
              type="button"
              onClick={handleAddBanner}
              className="bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-[10px] tracking-widest py-2.5 px-4 rounded-sm flex items-center gap-1.5 uppercase transition-all"
            >
              <Plus size={12} /> Add New Slide
            </button>
          </div>

          {(config.banners || []).map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-400"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 flex justify-between items-center">
                <span>Carousel Banner slide #{index + 1}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-luxury-gold uppercase font-mono">{banner.id}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold uppercase text-[9px] tracking-wider border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500/5 transition-colors"
                  >
                    Delete Slide
                  </button>
                </div>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Banner Headline</label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white font-bold uppercase"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Subtitle / Category Tag</label>
                  <input
                    type="text"
                    value={banner.subtitle}
                    onChange={(e) => handleBannerChange(index, "subtitle", e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white uppercase"
                  />
                </div>

                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Banner description</label>
                  <textarea
                    value={banner.description}
                    onChange={(e) => handleBannerChange(index, "description", e.target.value)}
                    rows={2}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Button Caption</label>
                  <input
                    type="text"
                    value={banner.buttonText}
                    onChange={(e) => handleBannerChange(index, "buttonText", e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white font-bold"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Button Redirect Link</label>
                  <input
                    type="text"
                    value={banner.link}
                    onChange={(e) => handleBannerChange(index, "link", e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Background Image Link (URL)</label>
                  <input
                    type="text"
                    value={banner.image}
                    onChange={(e) => handleBannerChange(index, "image", e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold text-zinc-900 dark:text-white font-mono"
                  />
                  <div className="relative w-full h-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">
                    <img src={banner.image} alt="Preview Banner" className="object-cover w-full h-full opacity-60" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Promo Highlight Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Promo Highlight Module Config
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Promo Headline</label>
                <input
                  type="text"
                  value={config.promoHighlight?.title || ""}
                  onChange={(e) => handlePromoChange("title", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold uppercase focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Promo Subtitle</label>
                <input
                  type="text"
                  value={config.promoHighlight?.subtitle || ""}
                  onChange={(e) => handlePromoChange("subtitle", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Button Caption</label>
                <input
                  type="text"
                  value={config.promoHighlight?.buttonText || ""}
                  onChange={(e) => handlePromoChange("buttonText", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Button Link</label>
                <input
                  type="text"
                  value={config.promoHighlight?.link || ""}
                  onChange={(e) => handlePromoChange("link", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Image URL</label>
                <input
                  type="text"
                  value={config.promoHighlight?.image || ""}
                  onChange={(e) => handlePromoChange("image", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* Brand Philosophy Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-600 dark:text-zinc-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Brand Philosophy (Philosophy Card)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Story Title</label>
                <input
                  type="text"
                  value={(config as any).brandStoryTitle || ""}
                  placeholder="Weaving Heritage with Modern Geometries"
                  onChange={(e) => handleConfigChange("brandStoryTitle", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Story Paragraph 1</label>
                <textarea
                  value={(config as any).brandStoryDesc1 || ""}
                  placeholder="Founded with a dedication to premium materials..."
                  onChange={(e) => handleConfigChange("brandStoryDesc1", e.target.value)}
                  rows={3}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Story Paragraph 2</label>
                <textarea
                  value={(config as any).brandStoryDesc2 || ""}
                  placeholder="We reject fast fashion cycles..."
                  onChange={(e) => handleConfigChange("brandStoryDesc2", e.target.value)}
                  rows={3}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">philosophy Image URL</label>
                <input
                  type="text"
                  value={(config as any).brandStoryImage || ""}
                  onChange={(e) => handleConfigChange("brandStoryImage", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Text Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Newsletter Customization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Headline</label>
                <input
                  type="text"
                  value={(config as any).newsletterTitle || ""}
                  placeholder="Unlock Exclusive Previews"
                  onChange={(e) => handleConfigChange("newsletterTitle", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Subtext Description</label>
                <textarea
                  value={(config as any).newsletterDesc || ""}
                  placeholder="Subscribe to our private list..."
                  onChange={(e) => handleConfigChange("newsletterDesc", e.target.value)}
                  rows={2}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-light focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* Value Badges Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Value Badges Bar (Free Delivery, Returns, etc.)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Badge 1 */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 1 Title</label>
                <input
                  type="text"
                  value={(config as any).service1Title || ""}
                  placeholder="Free Shipping"
                  onChange={(e) => handleConfigChange("service1Title", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 1 Description</label>
                <input
                  type="text"
                  value={(config as any).service1Desc || ""}
                  placeholder="On all orders above ₹2000"
                  onChange={(e) => handleConfigChange("service1Desc", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              
              {/* Badge 2 */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 2 Title</label>
                <input
                  type="text"
                  value={(config as any).service2Title || ""}
                  placeholder="7 Days Returns"
                  onChange={(e) => handleConfigChange("service2Title", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 2 Description</label>
                <input
                  type="text"
                  value={(config as any).service2Desc || ""}
                  placeholder="Easy return & exchange request"
                  onChange={(e) => handleConfigChange("service2Desc", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              
              {/* Badge 3 */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 3 Title</label>
                <input
                  type="text"
                  value={(config as any).service3Title || ""}
                  placeholder="Secure Payments"
                  onChange={(e) => handleConfigChange("service3Title", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 3 Description</label>
                <input
                  type="text"
                  value={(config as any).service3Desc || ""}
                  placeholder="Stripe, Razorpay, UPI & COD"
                  onChange={(e) => handleConfigChange("service3Desc", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              
              {/* Badge 4 */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 4 Title</label>
                <input
                  type="text"
                  value={(config as any).service4Title || ""}
                  placeholder="100% Genuine"
                  onChange={(e) => handleConfigChange("service4Title", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Badge 4 Description</label>
                <input
                  type="text"
                  value={(config as any).service4Desc || ""}
                  placeholder="Pure silks, linens & cottons"
                  onChange={(e) => handleConfigChange("service4Desc", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* Flash Sale Editor */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-4 text-xs font-light text-zinc-650 dark:text-zinc-400">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Flash Sale Clearance Config
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Flash Sale Badge</label>
                <input
                  type="text"
                  value={(config as any).flashSaleBadge || ""}
                  placeholder="FLASH SALE RUNNING"
                  onChange={(e) => handleConfigChange("flashSaleBadge", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold uppercase focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Timer Duration (Hours)</label>
                <input
                  type="number"
                  value={(config as any).flashSaleHours || ""}
                  placeholder="18"
                  onChange={(e) => handleConfigChange("flashSaleHours", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Flash Sale Title</label>
                <input
                  type="text"
                  value={(config as any).flashSaleTitle || ""}
                  placeholder="Mid-Season Clearance"
                  onChange={(e) => handleConfigChange("flashSaleTitle", e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Flash Sale Subtext / Description</label>
                <textarea
                  value={(config as any).flashSaleSubtitle || ""}
                  placeholder="Get premium Supima cotton tees, raw denim..."
                  onChange={(e) => handleConfigChange("flashSaleSubtitle", e.target.value)}
                  rows={2}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
