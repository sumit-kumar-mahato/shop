"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Trash2,
  Tag,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

interface NavbarProps {
  logoText: string;
  contactEmail?: string;
}

const Navbar: React.FC<NavbarProps> = ({ logoText, contactEmail }) => {
  const pathname = usePathname();
  const {
    cartItems,
    cartCount,
    removeFromCart,
    updateQuantity,
    subtotal,
    gst,
    discount,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingFee,
    addToCart
  } = useCart();

  const { wishlistItems, toggleWishlist } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Drawers Open States
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  // Asynchronous Live Search States
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Drawer Coupon State
  const [drawerCouponCode, setDrawerCouponCode] = useState("");
  const [drawerCouponError, setDrawerCouponError] = useState("");
  const [drawerCouponValidating, setDrawerCouponValidating] = useState(false);

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
    setCartDrawerOpen(false);
    setWishlistDrawerOpen(false);
  }, [pathname]);

  // Listen to custom dispatch events for opening drawers automatically
  useEffect(() => {
    const handleOpenCart = () => setCartDrawerOpen(true);
    const handleOpenWishlist = () => setWishlistDrawerOpen(true);

    window.addEventListener("open-cart-drawer", handleOpenCart);
    window.addEventListener("open-wishlist-drawer", handleOpenWishlist);

    return () => {
      window.removeEventListener("open-cart-drawer", handleOpenCart);
      window.removeEventListener("open-wishlist-drawer", handleOpenWishlist);
    };
  }, []);

  // Live Search suggestions debounced query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Live search suggestions error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleApplyDrawerCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerCouponCode.trim()) return;

    setDrawerCouponValidating(true);
    setDrawerCouponError("");
    const success = await applyCoupon(drawerCouponCode);
    setDrawerCouponValidating(false);

    if (success) {
      setDrawerCouponCode("");
    } else {
      setDrawerCouponError("Invalid coupon code");
    }
  };

  const navLinks = [
    { name: "SHOP ALL", href: "/shop" },
    { name: "MEN", href: "/shop?gender=Men" },
    { name: "WOMEN", href: "/shop?gender=Women" },
    { name: "KIDS", href: "/shop?gender=Kids" },
    { name: "OFFERS", href: "/offers" },
    { name: "BLOG", href: "/blog" },
  ];

  const freeShippingThreshold = 2000;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white h-16 flex items-center justify-between px-6 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display font-bold tracking-widest text-lg hover:text-luxury-gold transition-colors">
            {logoText} <span className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-luxury-gold px-2 py-0.5 rounded ml-2 font-mono uppercase">Storefront</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 px-3 py-1 rounded-full font-medium">
            ADMINISTRATOR MODE
          </span>
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
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
            <button
              onClick={() => setWishlistDrawerOpen(true)}
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Wishlist"
            >
              <Heart size={19} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="p-2 hover:bg-luxury-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Cart"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-luxury-gold text-zinc-950 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

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
          <div className="relative w-80 max-w-sm bg-white dark:bg-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl z-55 animate-fade-in-up">
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

      {/* Floating Smart Search bar with Live Asynchronous Suggestions */}
      {searchOpen && (
        <div className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-lg border-b border-luxury-200/50 dark:border-zinc-800 py-6 px-4 animate-slide-down">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
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

            {/* Live suggestions container */}
            {searchQuery.trim() && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-xl overflow-hidden animate-fade-in z-50">
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-xs text-zinc-500">
                    <Loader2 size={16} className="animate-spin text-luxury-gold" />
                    <span>Searching boutique archives...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 italic">
                    No matching apparel found for "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-150 dark:divide-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={11} /> Suggested Styles ({searchResults.length})
                    </div>
                    {searchResults.map((prod) => {
                      const imgs = JSON.parse(prod.images || "[]");
                      return (
                        <Link
                          key={prod.id}
                          href={`/product/${prod.id}`}
                          className="flex items-center gap-4 p-3 hover:bg-luxury-50 dark:hover:bg-zinc-800/40 transition-colors text-left"
                        >
                          <div className="relative w-10 h-12 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={imgs[0] || "/placeholder.jpg"} alt={prod.title} className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] text-luxury-500 font-bold uppercase tracking-widest block">{prod.categoryName}</span>
                            <h4 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 uppercase truncate mt-0.5">{prod.title}</h4>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mt-0.5 block">₹{prod.price}</span>
                          </div>
                          <ArrowUpRight size={14} className="text-zinc-400" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over CUSTOMER CART DRAWER */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setCartDrawerOpen(false)}
          />
          {/* Drawer container */}
          <div className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                <ShoppingBag size={18} className="text-luxury-gold" /> Shopping Bag ({cartCount})
              </h3>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Tracker */}
            {cartItems.length > 0 && (
              <div className="px-6 py-3.5 bg-luxury-100/40 dark:bg-zinc-950 border-b border-zinc-200/50 dark:border-zinc-800/50 text-xs font-light text-left">
                <div className="flex justify-between items-center">
                  <span>
                    {remainingForFreeShipping > 0 ? (
                      <>Add <span className="font-bold text-luxury-gold">₹{remainingForFreeShipping}</span> more for <span className="font-bold uppercase text-green-600">Free Shipping</span></>
                    ) : (
                      <span className="text-green-600 font-bold uppercase tracking-wider">🎉 Your order qualifies for Free Shipping!</span>
                    )}
                  </span>
                  <span className="font-semibold font-mono text-[10px]">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-luxury-gold h-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scrollable Items list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <ShoppingBag size={40} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-550 font-light">Your shopping bag is completely empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setCartDrawerOpen(false)}
                    className="inline-block bg-luxury-900 text-white hover:bg-luxury-gold hover:text-zinc-950 text-[10px] font-bold tracking-widest px-6 py-3 rounded-sm transition-all uppercase"
                  >
                    Explore Shop
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-sm relative"
                  >
                    <div className="relative w-16 aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                    </div>

                    <div className="flex-grow min-w-0 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 uppercase truncate">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="hover:text-red-500 text-zinc-400 p-0.5 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-light mt-0.5 flex gap-3 uppercase font-mono">
                        <span>Sz: <strong className="text-zinc-700 dark:text-zinc-300">{item.size}</strong></span>
                        <span>Col: <strong className="text-zinc-700 dark:text-zinc-300">{item.color}</strong></span>
                      </p>

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 h-7 rounded bg-white dark:bg-zinc-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 text-xs font-bold hover:text-luxury-gold"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-semibold font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 text-xs font-bold hover:text-luxury-gold"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout Calculations */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-4">
                {/* Coupon form */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-500 text-[10px] font-bold px-3 py-2 border border-green-200 dark:border-green-800/40 rounded">
                      <span className="flex items-center gap-1 uppercase tracking-wide">
                        Code: <strong>{appliedCoupon.code}</strong> (
                        {appliedCoupon.type === "PERCENTAGE" ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`})
                      </span>
                      <button onClick={removeCoupon} className="hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyDrawerCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code"
                        value={drawerCouponCode}
                        onChange={(e) => setDrawerCouponCode(e.target.value)}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] p-2 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white flex-grow uppercase font-semibold font-mono"
                      />
                      <button
                        type="submit"
                        disabled={drawerCouponValidating}
                        className="bg-zinc-800 dark:bg-zinc-900 text-white font-bold text-[10px] tracking-wider px-3 rounded hover:bg-luxury-gold hover:text-zinc-950 transition-colors"
                      >
                        {drawerCouponValidating ? "..." : "APPLY"}
                      </button>
                    </form>
                  )}
                  {drawerCouponError && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-semibold">
                      <ShieldAlert size={11} /> {drawerCouponError}
                    </p>
                  )}
                </div>

                {/* Totals Summary */}
                <div className="space-y-2 text-xs font-light text-left">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span className="font-semibold font-mono">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">GST Tax (12%)</span>
                    <span className="font-semibold font-mono">₹{gst}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span className="font-mono">-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Shipping</span>
                    <span className="font-mono">
                      {shippingFee > 0 ? `₹${shippingFee}` : <strong className="text-green-600 uppercase text-[10px]">Free</strong>}
                    </span>
                  </div>
                  <div className="flex justify-between items-end text-sm font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-800 dark:text-zinc-200 uppercase tracking-widest text-[11px]">Final Total</span>
                    <span className="text-base text-luxury-gold font-mono">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout Link */}
                <Link
                  href="/checkout"
                  onClick={() => setCartDrawerOpen(false)}
                  className="w-full bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 h-12 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 rounded transition-all border border-luxury-900"
                >
                  CHECKOUT NOW <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over CUSTOMER WISHLIST DRAWER */}
      {wishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setWishlistDrawerOpen(false)}
          />
          {/* Drawer container */}
          <div className="absolute top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800 animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                <Heart size={18} fill="currentColor" className="text-red-500" /> Wishlist ({wishlistItems.length})
              </h3>
              <button
                onClick={() => setWishlistDrawerOpen(false)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Items list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <Heart size={40} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-550 font-light">Your wishlist is currently empty.</p>
                  <Link
                    href="/shop"
                    onClick={() => setWishlistDrawerOpen(false)}
                    className="inline-block bg-luxury-900 text-white hover:bg-luxury-gold hover:text-zinc-950 text-[10px] font-bold tracking-widest px-6 py-3 rounded-sm transition-all uppercase"
                  >
                    Explore Catalog
                  </Link>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-sm relative text-left"
                  >
                    <div className="relative w-16 aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                      <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                    </div>

                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 uppercase truncate">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="hover:text-red-500 text-zinc-400 p-0.5 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <span className="text-[9px] tracking-widest text-luxury-500 font-bold uppercase">{item.categoryName}</span>
                        <p className="text-xs font-bold font-mono text-zinc-900 dark:text-white mt-1">₹{item.price}</p>
                      </div>

                      {/* Quick Move to Bag */}
                      <button
                        onClick={() => {
                          addToCart({
                            productId: item.productId,
                            title: item.title,
                            price: item.price,
                            image: item.image,
                            size: "M",
                            color: "Gold",
                            quantity: 1,
                            stock: item.stock,
                          });
                          toggleWishlist(item);
                          // Delay slightly to allow add animation to proceed before cart slides
                          setTimeout(() => {
                            setWishlistDrawerOpen(false);
                            setCartDrawerOpen(true);
                          }, 250);
                        }}
                        disabled={item.stock === 0}
                        className="text-[10px] font-bold bg-zinc-850 hover:bg-luxury-gold text-white hover:text-zinc-950 py-1.5 px-3 rounded uppercase transition-colors text-center w-full flex items-center justify-center gap-1 mt-2 disabled:opacity-50"
                      >
                        <ShoppingBag size={11} /> {item.stock === 0 ? "Out of Stock" : "Move to Bag"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
