"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import type { Gender } from "@prisma/client";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import SearchOverlay from "./SearchOverlay";
import ThemeToggle from "./ThemeToggle";

type NavCategory = { name: string; slug: string; gender: Gender | null };

const MAIN_LINKS = [
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Kids", href: "/shop?gender=kids" },
  { label: "Offers", href: "/offers" },
  { label: "Journal", href: "/blog" },
];

export default function Navbar({
  logoText,
  announcement,
  categories,
}: {
  logoText: string;
  announcement: { text: string; link: string } | null;
  categories: NavCategory[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSession();
  const { count, openDrawer } = useCart();
  const wishlist = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const close = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [accountOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !/input|textarea|select/i.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/";
  };

  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";
  const iconBtn = "relative rounded-full p-2 text-luxury-800 transition-colors hover:bg-luxury-100 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <>
      {announcement && (
        <div className="bg-luxury-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-white dark:bg-zinc-900">
          {announcement.link ? (
            <Link href={announcement.link} className="hover:underline">
              {announcement.text}
            </Link>
          ) : (
            announcement.text
          )}
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-all duration-300",
          scrolled ? "glass border-luxury-200/70 shadow-sm dark:border-zinc-800" : "border-transparent bg-luxury-50 dark:bg-zinc-950",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
          <div className="flex items-center gap-2 lg:gap-10">
            <button className={cn(iconBtn, "lg:hidden")} onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <Link href="/" className="font-display text-base font-bold tracking-[0.18em] text-luxury-900 dark:text-white sm:text-xl">
              {logoText}
            </Link>

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
              <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
                <Link
                  href="/shop"
                  className="flex items-center gap-1 text-sm font-medium text-luxury-700 hover:text-luxury-900 dark:text-zinc-300 dark:hover:text-white"
                  aria-expanded={shopOpen}
                >
                  Shop <ChevronDown size={14} />
                </Link>
                {shopOpen && categories.length > 0 && (
                  <div className="absolute left-0 top-full z-50 w-[28rem] animate-slide-down pt-3">
                    <div className="grid grid-cols-2 gap-1 rounded-sm border border-luxury-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                      <Link href="/shop" className="col-span-2 rounded-sm px-3 py-2 text-sm font-semibold hover:bg-luxury-50 dark:hover:bg-zinc-800">
                        All products →
                      </Link>
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/shop?category=${c.slug}`}
                          className="rounded-sm px-3 py-2 text-sm text-luxury-700 hover:bg-luxury-50 hover:text-luxury-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {MAIN_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm font-medium text-luxury-700 hover:text-luxury-900 dark:text-zinc-300 dark:hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button className={iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search (press /)">
              <Search size={20} />
            </button>
            <ThemeToggle className={cn(iconBtn, "hidden sm:inline-flex")} />
            <Link href="/account/wishlist" className={cn(iconBtn, "hidden sm:inline-flex")} aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.ids.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {wishlist.ids.size}
                </span>
              )}
            </Link>

            <div className="relative" ref={accountRef}>
              {user ? (
                <button className={iconBtn} onClick={() => setAccountOpen((o) => !o)} aria-label="Account menu" aria-expanded={accountOpen}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-fg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </button>
              ) : (
                <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={iconBtn} aria-label="Sign in">
                  <User size={20} />
                </Link>
              )}
              {accountOpen && user && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 animate-slide-down rounded-sm border border-luxury-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="border-b border-luxury-100 px-4 pb-2 dark:border-zinc-800">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-luxury-500">{user.email}</p>
                  </div>
                  <MenuLink href="/account" icon={<User size={16} />}>My account</MenuLink>
                  <MenuLink href="/account/orders" icon={<Package size={16} />}>My orders</MenuLink>
                  <MenuLink href="/account/wishlist" icon={<Heart size={16} />}>Wishlist</MenuLink>
                  {isStaff && <MenuLink href="/admin" icon={<LayoutDashboard size={16} />}>Admin dashboard</MenuLink>}
                  <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-luxury-50 dark:hover:bg-zinc-800">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>

            <button className={iconBtn} onClick={openDrawer} aria-label={`Shopping bag, ${count} items`}>
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-fg">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm animate-slide-in-left flex-col bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-luxury-100 px-5 py-4 dark:border-zinc-800">
              <span className="font-display text-sm font-bold tracking-[0.18em]">{logoText}</span>
              <button onClick={() => setMobileOpen(false)} className={iconBtn} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
              <Link href="/shop" className="block border-b border-luxury-100 py-3 font-medium dark:border-zinc-800">
                Shop all
              </Link>
              {MAIN_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="block border-b border-luxury-100 py-3 font-medium dark:border-zinc-800">
                  {l.label}
                </Link>
              ))}
              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-luxury-500">Categories</p>
              <div className="grid grid-cols-2 gap-x-3">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} className="py-2 text-sm text-luxury-700 dark:text-zinc-300">
                    {c.name}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="space-y-1 border-t border-luxury-100 px-5 py-4 dark:border-zinc-800">
              {user ? (
                <>
                  <Link href="/account" className="flex items-center gap-3 py-2 text-sm"><User size={16} /> My account</Link>
                  <Link href="/account/orders" className="flex items-center gap-3 py-2 text-sm"><Package size={16} /> My orders</Link>
                  {isStaff && <Link href="/admin" className="flex items-center gap-3 py-2 text-sm"><LayoutDashboard size={16} /> Admin dashboard</Link>}
                  <button onClick={logout} className="flex items-center gap-3 py-2 text-sm text-red-600"><LogOut size={16} /> Sign out</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="flex h-11 items-center justify-center rounded-sm bg-luxury-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">Sign in</Link>
                  <Link href="/register" className="flex h-11 items-center justify-center rounded-sm border border-luxury-300 text-sm font-semibold dark:border-zinc-700">Register</Link>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 text-sm text-luxury-600 dark:text-zinc-400">
                Theme <ThemeToggle className={iconBtn} />
              </div>
            </div>
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} onSubmit={(q) => router.push(`/shop?q=${encodeURIComponent(q)}`)} />
    </>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 text-sm text-luxury-800 hover:bg-luxury-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {icon} {children}
    </Link>
  );
}
