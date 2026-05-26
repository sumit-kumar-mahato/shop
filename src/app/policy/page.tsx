"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, FileText } from "lucide-react";

function PolicyPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Tabs: "shipping" | "returns" | "privacy" | "terms"
  const [activeTab, setActiveTab] = useState<"shipping" | "returns" | "privacy" | "terms">("shipping");

  useEffect(() => {
    if (tabParam && ["shipping", "returns", "privacy", "terms"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const tabsConfig = [
    { id: "shipping", name: "Shipping & Delivery", icon: Truck },
    { id: "returns", name: "Returns & Exchanges", icon: RotateCcw },
    { id: "privacy", name: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", name: "Terms & Conditions", icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar navigation tabs */}
      <div className="flex flex-col space-y-1.5 lg:border-r lg:border-luxury-200/50 lg:dark:border-zinc-800/50 lg:pr-8">
        <h2 className="serif-header text-lg uppercase tracking-wide mb-4 text-center lg:text-left">Legal Policies</h2>
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider uppercase border transition-all rounded-sm ${
                activeTab === tab.id
                  ? "bg-luxury-900 border-luxury-900 text-white dark:bg-luxury-gold dark:border-luxury-gold dark:text-zinc-950"
                  : "border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-luxury-gold/50"
              }`}
            >
              <Icon size={14} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Policy contents */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-luxury-200/40 dark:border-zinc-800/40 p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
        {activeTab === "shipping" && (
          <div className="space-y-4 font-light text-xs sm:text-sm text-luxury-600 dark:text-zinc-400 leading-relaxed">
            <h1 className="serif-header text-xl uppercase tracking-wider text-zinc-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <Truck className="text-luxury-gold" size={20} /> Shipping & Delivery Policy
            </h1>
            <p>
              We partner with India's leading express logistics providers (BlueDart, Delhivery, DHL) to ensure all garments reach our clients in pristine condition.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Shipping Rates & Timelines
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Standard Shipping (Metro cities): 3-5 business days. Free above ₹2000, otherwise ₹150 flat fee.</li>
              <li>Standard Shipping (Non-Metro): 5-7 business days.</li>
              <li>Express Air Delivery: 1-2 business days. Flat fee of ₹350 applies.</li>
            </ul>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Shipment Tracking
            </p>
            <p>
              Once your garment leaves our couture facility, a confirmation email and WhatsApp alert containing your tracking link (e.g. TRK-827364) will be sent. You can track package status directly on the User Account dashboard.
            </p>
          </div>
        )}

        {activeTab === "returns" && (
          <div className="space-y-4 font-light text-xs sm:text-sm text-luxury-600 dark:text-zinc-400 leading-relaxed">
            <h1 className="serif-header text-xl uppercase tracking-wider text-zinc-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <RotateCcw className="text-luxury-gold" size={20} /> Returns & Exchange Policy
            </h1>
            <p>
              Prabodh Kumar Mahato values customer delight. We accept return or exchange requests within **7 days** of delivery.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Garment Return Eligibility
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>The garment must be unworn, unwashed, and undamaged.</li>
              <li>All original tags, custom branding ribbons, and protective covers must remain intact.</li>
              <li>Sarees, kurtas, and silk shirts must not be modified or tailored.</li>
            </ul>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Refund Credits
            </p>
            <p>
              Once our QC inspectors approve the returned garment, the refund will be credited directly to your bank account (for COD/UPI orders) or reversed to your credit card (for card orders) within 5-7 working days.
            </p>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-4 font-light text-xs sm:text-sm text-luxury-600 dark:text-zinc-400 leading-relaxed">
            <h1 className="serif-header text-xl uppercase tracking-wider text-zinc-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-luxury-gold" size={20} /> Privacy Policy
            </h1>
            <p>
              Your data security is paramount. This policy describes how we collect, store, and process client contact info when shopping at Prabodh Kumar Mahato.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Information We Collect
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Client Name, Email, and Phone number during checkout.</li>
              <li>Delivery addresses and postal codes.</li>
              <li>Transaction logs and invoice reference files.</li>
            </ul>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Data Security
            </p>
            <p>
              We store all profile details in secure, encrypted cloud databases. We do NOT store credit card details or bank passwords on our servers. All transactions are securely routed through PCI-DSS compliant Stripe and Razorpay gateways.
            </p>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-4 font-light text-xs sm:text-sm text-luxury-600 dark:text-zinc-400 leading-relaxed">
            <h1 className="serif-header text-xl uppercase tracking-wider text-zinc-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <FileText className="text-luxury-gold" size={20} /> Terms & Conditions of Use
            </h1>
            <p>
              By accessing and placing orders on this website, you agree to comply with our Terms of Use.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Garment Pricing & Color Variations
            </p>
            <p>
              We strive to represent clothing colors and fabrics accurately. However, minor hue variations can occur due to monitor calibration or artisanal batch dyeing. Prices are subject to revision without prior notice.
            </p>
            <p className="font-semibold text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider pt-2">
              Limitation of Liability
            </p>
            <p>
              Prabodh Kumar Mahato is not liable for delayed package deliveries caused by extreme weather, customs checks, or regional logistics lockdowns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PolicyPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs tracking-widest text-luxury-500 uppercase">Loading documents...</div>}>
      <PolicyPageContent />
    </Suspense>
  );
}
