"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import {
  ShoppingBag,
  Heart,
  User,
  Settings,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Tag,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  logoText: string;
  contactEmail?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logoText, contactEmail }) => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme Sync
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
      localStorage.setItem("theme", "dark");
    }
  };

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "SHOP ALL", href: "/shop" },
    { name: "MEN", href: "/shop?gender=Men" },
    { name: "WOMEN", href: "/shop?gender=Women" },
    { name: "KIDS", href: "/shop?gender=Kids" },
    { name: "OFFERS", href: "/offers" },
    { name: "BLOG", href: "/blog" },
  ];

  // Check if we are in admin pages to hide customer navigation or alter styling
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    // Admin header: minimal, focusing on visual dashboard management
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-zinc-900 border-b border-zinc-800 text-white h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display font-bold tracking-widest text-lg hover:text-luxury-gold transition-colors">
            {logoText} <span className="text-xs bg-zinc-800 border border-zinc-700 text-luxury-gold px-2 py-0.5 rounded ml-2 font-mono uppercase">Storefront</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 px-3 py-1 rounded-full font-medium">
            ADMINISTRATOR MODE
          </span>
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-semibold px-4 py-1.5 rounded transition-all active:scale-95"
          >
            <Settings size={16} />
            Control Center
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "glass py-3 shadow-sm border-b border-luxury-200/40 dark:border-zinc-800/40"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link
              href="/"
              className="font-display font-bold tracking-widest text-xl sm:text-2xl transition-all duration-300 hover:opacity-85 text-zinc-900 dark:text-white inline-block"
              style={{ color: "var(--secondary-color)" }}
            >
              {logoText}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-semibold tracking-widest hover:text-luxury-gold transition-colors ${
                  pathname === link.href ? "text-luxury-gold border-b border-luxury-gold pb-1" : "text-luxury-600 dark:text-zinc-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icon Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Search Products"
            >
              <Search size={19} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Wishlist"
            >
              <Heart size={19} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-luxury-gold text-zinc-950 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              href="/profile"
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
              title="User Account"
            >
              <User size={19} />
            </Link>

            {/* Quick Admin Access */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold tracking-wider text-luxury-gold bg-luxury-gold/5 dark:bg-luxury-gold/10 border border-luxury-gold/20 rounded-full hover:border-luxury-gold/40 transition-colors ml-2"
              title="CMS Panel"
            >
              <Settings size={14} />
              <span>CMS</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-80 max-w-sm bg-white dark:bg-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-fade-in-up">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-display font-bold tracking-widest text-lg text-zinc-900 dark:text-white">{logoText}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm font-semibold tracking-widest border-b border-luxury-100 dark:border-zinc-800 pb-3 hover:text-luxury-gold text-zinc-800 dark:text-zinc-200"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-semibold tracking-widest text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg border border-luxury-gold/30 hover:bg-luxury-gold/20"
                >
                  <Settings size={18} />
                  ADMIN CMS PANEL
                </Link>
              </div>
            </div>

            <div className="border-t border-luxury-100 dark:border-zinc-800 pt-6">
              <p className="text-xs text-luxury-500 mb-1">CONCIERGE</p>
              <p className="text-sm font-medium">{contactEmail || "concierge@prabodhclothing.com"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Smart Search bar */}
      {searchOpen && (
        <div className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg border-b border-luxury-200/50 dark:border-zinc-800 py-6 px-4 animate-slide-down">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <Search size={22} className="text-luxury-400" />
            <input
              type="text"
              placeholder="Search for Shirts, Sarees, Jeans, Fabrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
              className="w-full bg-transparent border-b-2 border-luxury-200 dark:border-zinc-800 py-2 text-lg focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
              autoFocus
            />
            <button
              onClick={() => {
                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                } else {
                  setSearchOpen(false);
                }
              }}
              className="bg-luxury-900 dark:bg-zinc-800 text-white px-5 py-2 text-xs font-semibold tracking-wider hover:bg-luxury-gold transition-colors rounded-sm"
            >
              SEARCH
            </button>
            <button onClick={() => setSearchOpen(false)} className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
