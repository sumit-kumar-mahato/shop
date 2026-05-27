"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Instagram, Facebook, Phone, MapPin } from "lucide-react";

interface FooterProps {
  storeName: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

const Footer: React.FC<FooterProps> = ({
  storeName,
  contactEmail,
  contactPhone,
  address,
  instagramUrl,
  facebookUrl,
}) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-luxury-900 text-luxury-100 dark:bg-black dark:text-zinc-300 pt-16 pb-12 border-t border-luxury-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link href="/" className="font-display font-bold tracking-widest text-xl text-white">
            {storeName}
          </Link>
          <p className="text-sm text-luxury-400 dark:text-zinc-500 leading-relaxed font-light">
            Luxury apparel, tailored French linen shirts, silk sarees, and modern fashion crafted for premium wardrobes worldwide.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href={instagramUrl || "https://instagram.com"} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-luxury-800/50 hover:bg-luxury-gold flex items-center justify-center hover:text-zinc-955 transition-all">
              <Instagram size={16} />
            </a>
            <a href={facebookUrl || "https://facebook.com"} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-luxury-800/50 hover:bg-luxury-gold flex items-center justify-center hover:text-zinc-955 transition-all">
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-white mb-6 uppercase">COLLECTIONS</h4>
          <ul className="space-y-3 text-sm font-light text-luxury-400 dark:text-zinc-400">
            <li><Link href="/shop?gender=Men" className="hover:text-luxury-gold transition-colors">Men's Wardrobe</Link></li>
            <li><Link href="/shop?gender=Women" className="hover:text-luxury-gold transition-colors">Women's Couture</Link></li>
            <li><Link href="/shop?gender=Kids" className="hover:text-luxury-gold transition-colors">Kids wear</Link></li>
            <li><Link href="/shop?category=sarees" className="hover:text-luxury-gold transition-colors">Sarees & Ethnic Wear</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-luxury-gold transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Support Column */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-white mb-6 uppercase">CLIENT SERVICES</h4>
          <ul className="space-y-3 text-sm font-light text-luxury-400 dark:text-zinc-400">
            <li><Link href="/policy?tab=shipping" className="hover:text-luxury-gold transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/policy?tab=returns" className="hover:text-luxury-gold transition-colors">Returns & Refunds</Link></li>
            <li><Link href="/faq" className="hover:text-luxury-gold transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/policy?tab=privacy" className="hover:text-luxury-gold transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policy?tab=terms" className="hover:text-luxury-gold transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="text-xs font-bold tracking-widest text-white mb-6 uppercase">NEWSLETTER</h4>
          <p className="text-sm font-light text-luxury-400 dark:text-zinc-500 mb-4">
            Subscribe to receive private updates, seasonal arrivals, and member-only previews.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex border-b border-luxury-700 pb-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-sm w-full focus:outline-none placeholder-luxury-500 text-white pr-8"
              required
            />
            <button type="submit" className="absolute right-0 top-0.5 hover:text-luxury-gold transition-colors">
              <ArrowRight size={18} />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-luxury-gold mt-2 font-medium animate-fade-in">
              Thank you for subscribing to our mailing list.
            </p>
          )}
          <div className="mt-8 space-y-2 text-xs font-light text-luxury-400 dark:text-zinc-500">
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-luxury-gold" /> {contactEmail || "contact@prabodhclothing.com"}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-luxury-gold" /> {contactPhone || "+91 98765 43210"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={13} className="text-luxury-gold" /> {address || "Chowka, Jharkhand, Pincode-832404"}
            </p>
          </div>
        </div>
      </div>

      {/* Trademark bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-luxury-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-light text-luxury-500 dark:text-zinc-600">
        <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Designed for Premium Clothing Retail.</p>
      </div>
    </footer>
  );
};

export default Footer;
