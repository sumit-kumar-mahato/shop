"use client";

import React, { useState } from "react";
import { Tag, Ticket, HelpCircle, Check, Copy } from "lucide-react";
import confetti from "canvas-confetti";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons = [
    {
      code: "FASHION20",
      title: "20% off Storewide",
      subtitle: "On french linens, cotton basics & sarees",
      minSpend: "₹0 Minimum spend",
      validUntil: "Valid till Dec 31, 2027",
    },
    {
      code: "FESTIVE10",
      title: "10% off Bridal Sarees",
      subtitle: "Includes Banarasi Silk & Embroidered Suits",
      minSpend: "₹3000 Minimum spend",
      validUntil: "Valid till Dec 31, 2027",
    },
    {
      code: "FLAT1000",
      title: "Flat ₹1000 Discount",
      subtitle: "Premium suit wardrobes & luxury accessories",
      minSpend: "₹8000 Minimum spend",
      validUntil: "Valid till Dec 31, 2027",
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    confetti({
      particleCount: 30,
      spread: 30,
      origin: { y: 0.8 },
      colors: ["#c5a880", "#000000"],
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center space-y-3 mb-12">
        <span className="text-[10px] font-bold tracking-widest text-luxury-gold uppercase">Exclusive Society Privileges</span>
        <h1 className="serif-header text-3xl sm:text-4xl font-normal uppercase tracking-wide">Offers & Coupons</h1>
        <div className="w-12 h-[1px] bg-luxury-gold mx-auto mt-2" />
        <p className="text-xs text-luxury-500 font-light max-w-sm mx-auto leading-relaxed pt-1">
          Apply these coupon vouchers during checkout to redeem private client discounts on your orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="relative border border-dashed border-luxury-300 dark:border-zinc-800 p-6 rounded-sm bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between space-y-6"
          >
            {/* Coupon Ribbon Visual */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-luxury-gold">
                <Ticket size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">OFFER VOUCHER</span>
              </div>
              <h3 className="serif-header text-xl uppercase tracking-wide text-zinc-900 dark:text-white font-semibold">
                {coupon.title}
              </h3>
              <p className="text-xs text-luxury-500 font-light leading-relaxed">{coupon.subtitle}</p>
            </div>

            <div className="pt-4 border-t border-luxury-100 dark:border-zinc-800/80 space-y-4">
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                <span>{coupon.minSpend}</span>
                <span>{coupon.validUntil}</span>
              </div>

              {/* Copy Code Action Box */}
              <button
                onClick={() => handleCopy(coupon.code)}
                className={`w-full h-11 border text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all rounded-sm ${
                  copiedCode === coupon.code
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-luxury-900 text-zinc-950 dark:border-luxury-gold dark:text-luxury-gold hover:bg-luxury-900 hover:text-white dark:hover:bg-luxury-gold dark:hover:text-zinc-950"
                }`}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check size={14} /> COPIED VOUCHER!
                  </>
                ) : (
                  <>
                    <Copy size={13} /> COPY CODE: {coupon.code}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
