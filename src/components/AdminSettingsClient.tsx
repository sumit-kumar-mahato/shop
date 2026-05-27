"use client";

import React, { useState } from "react";
import { Settings, Save, Smartphone, Instagram, Facebook, Search, ShoppingBag, Menu, Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface AdminSettingsClientProps {
  initialSettings: {
    storeName: string;
    logoText: string;
    primaryColor: string;
    secondaryColor: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    seoTitle: string;
    seoDescription: string;
    banners: any[];
    sectionsOrder: string[];
    promoHighlight: any;
    instagramUrl?: string;
    facebookUrl?: string;
  };
}

export default function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/cms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        confetti({
          particleCount: 50,
          spread: 30,
          origin: { y: 0.8 },
          colors: ["#c5a880", "#ffffff"],
        });
      } else {
        alert("Failed to save website configurations.");
      }
    } catch (e) {
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6 text-xs font-light text-zinc-555 dark:text-zinc-400">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white flex items-center gap-2">
              <Settings className="text-luxury-gold animate-spin-slow w-5 h-5" /> Website & Theme Settings
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Visually edit branding, meta descriptions, and contacts.</p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-955 font-bold text-xs tracking-wider py-3 px-6 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
          >
            <Save size={16} /> {saving ? "SAVING..." : "SAVE SETTINGS"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  General Branding
                </h3>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => handleFieldChange("storeName", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Logo Brand Text</label>
                  <input
                    type="text"
                    value={settings.logoText}
                    onChange={(e) => handleFieldChange("logoText", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-bold font-mono tracking-widest uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex flex-col space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Primary Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor.startsWith("#") && settings.primaryColor.length === 7 ? settings.primaryColor : "#c5a880"}
                        onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                        className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                        className="flex-grow bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono font-bold text-center"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Secondary Accent Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.secondaryColor.startsWith("#") && settings.secondaryColor.length === 7 ? settings.secondaryColor : "#111827"}
                        onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                        className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={settings.secondaryColor}
                        onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                        className="flex-grow bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono font-bold text-center"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2 border-t border-zinc-200 dark:border-zinc-850">
                  <label className="text-[9px] font-bold text-zinc-555 dark:text-zinc-500 uppercase tracking-widest">Preset Designer Themes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Luxury Gold", primary: "#c5a880", secondary: "#111827" },
                      { name: "Royal Emerald", primary: "#10b981", secondary: "#064e3b" },
                      { name: "Crimson Silk", primary: "#dc2626", secondary: "#450a0a" },
                      { name: "Midnight Purple", primary: "#8b5cf6", secondary: "#1e1b4b" }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setSettings((prev) => ({
                            ...prev,
                            primaryColor: preset.primary,
                            secondaryColor: preset.secondary
                          }));
                        }}
                        className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-luxury-gold p-2.5 rounded transition-all text-left"
                      >
                        <div className="flex gap-1 flex-shrink-0">
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: preset.primary }} />
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: preset.secondary }} />
                        </div>
                        <span className="text-[8px] text-zinc-800 dark:text-zinc-300 font-bold uppercase tracking-wider truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  Store Contacts
                </h3>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Concierge Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Store Hotline Phone</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Boutique Galleria Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Instagram Profile Link</label>
                  <input
                    type="text"
                    value={(settings as any).instagramUrl || ""}
                    onChange={(e) => handleFieldChange("instagramUrl", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Facebook Page Link</label>
                  <input
                    type="text"
                    value={(settings as any).facebookUrl || ""}
                    onChange={(e) => handleFieldChange("facebookUrl", e.target.value)}
                    className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">
                SEO Google Metadata Settings
              </h3>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Homepage Browser Tab Title (SEO Title)</label>
                <input
                  type="text"
                  value={settings.seoTitle}
                  onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
                  className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Google Snippet Description (SEO Description)</label>
                <textarea
                  value={settings.seoDescription}
                  onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                  rows={3}
                  className="bg-zinc-55 dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-light"
                  required
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 sticky top-24 flex flex-col items-center space-y-4">
            <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest flex items-center gap-1">
              <Smartphone size={12} /> Live Storefront Simulator
            </span>

            <div className="w-full max-w-[280px] aspect-[9/18] border-8 border-zinc-950 dark:border-zinc-900 rounded-[36px] shadow-2xl relative overflow-hidden bg-white dark:bg-zinc-950 flex flex-col border-collapse">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-4 bg-zinc-950 dark:bg-zinc-900 rounded-b-xl z-30" />

              <div className="pt-5 pb-2 px-3 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur z-20">
                <span className="font-display font-bold text-[10px] tracking-wider uppercase truncate max-w-[100px]" style={{ color: settings.secondaryColor }}>
                  {settings.logoText || "PRABODH"}
                </span>
                <div className="flex gap-1.5 text-zinc-400">
                  <Search size={10} />
                  <ShoppingBag size={10} style={{ color: settings.primaryColor }} />
                  <Menu size={10} />
                </div>
              </div>

              <div className="flex-grow overflow-hidden flex flex-col bg-zinc-50 dark:bg-zinc-900 relative">
                <div className="relative h-28 bg-cover bg-center flex items-center p-3 text-left" style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.65) 40%, transparent), url(${settings.banners[0]?.image || "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=400&auto=format&fit=crop&q=80"})` }}>
                  <div className="space-y-1">
                    <span className="inline-block text-[6px] text-white/90 border-b border-white pb-0.5 font-bold uppercase tracking-wider">
                      {settings.banners[0]?.subtitle || "New Arrival"}
                    </span>
                    <h4 className="text-[9px] serif-header text-white font-normal uppercase leading-tight line-clamp-2">
                      {settings.banners[0]?.title || "Heritage Shirts"}
                    </h4>
                    <span className="inline-block bg-white text-zinc-900 text-[5px] font-bold py-0.5 px-2 rounded-sm" style={{ color: settings.secondaryColor }}>
                      SHOP NOW
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-2 flex-grow">
                  <div className="flex justify-between items-center text-[7px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    <span>Curated Selection</span>
                    <span style={{ color: settings.primaryColor }}>View All</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { title: "Linen Shirt", price: "₹2,499", img: "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=400&auto=format&fit=crop&q=80" },
                      { title: "Silk Lehenga", price: "₹9,999", img: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=400&auto=format&fit=crop&q=80" }
                    ].map((p, idx) => (
                      <div key={idx} className="bg-white dark:bg-zinc-950 p-1.5 border border-zinc-150 dark:border-zinc-800 rounded-sm space-y-1 text-[7px] text-left">
                        <div className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-sm overflow-hidden relative">
                          <img src={p.img} alt={p.title} className="object-cover w-full h-full" />
                          <span className="absolute top-1 right-1 bg-white dark:bg-zinc-800 text-[5px] p-0.5 rounded-full flex items-center justify-center">
                            <Heart size={6} fill="red" className="text-red-500" />
                          </span>
                        </div>
                        <h5 className="font-semibold text-zinc-800 dark:text-zinc-300 truncate uppercase">{p.title}</h5>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 font-mono" style={{ color: settings.primaryColor }}>{p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 text-white/50 text-[6px] space-y-1 border-t border-zinc-800 text-left">
                  <h6 className="font-bold text-[7px] tracking-wider uppercase text-white">{settings.storeName || "BOUTIQUE"}</h6>
                  <p className="truncate">Concierge: {settings.contactEmail}</p>
                  <p>Hotline: {settings.contactPhone}</p>
                  <div className="flex gap-2 pt-1 border-t border-white/5 text-white/80">
                    {settings.instagramUrl && <Instagram size={8} />}
                    {settings.facebookUrl && <Facebook size={8} />}
                    <span className="ml-auto uppercase text-[5px]">© 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200 dark:border-zinc-800 rounded-sm text-[10px] text-zinc-500 font-light text-center max-w-[280px]">
              The simulator renders style accents, colors, and contacts dynamically. Presets update colors instantly.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
