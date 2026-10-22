"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import type { Gender } from "@prisma/client";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useSession } from "@/components/providers/SessionProvider";
import SmartImage from "@/components/ui/SmartImage";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import SearchOverlay from "./SearchOverlay";
import ThemeToggle from "./ThemeToggle";

type NavCategory = { name: string; slug: string; gender: Gender | null; image: string | null };

const MAIN_LINKS = [
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Kids", href: "/shop?gender=kids" },
  { label: "Offers", href: "/offers" },
  { label: "Journal", href: "/blog" },
];

const GROUPS: Array<{ title: string; match: (g: Gender | null) => boolean }> = [
  { title: "Women", match: (g) => g === "WOMEN" },
  { title: "Men", match: (g) => g === "MEN" },
  { title: "Kids", match: (g) => g === "KIDS" },
  { title: "Everyone", match: (g) => g === null || g === "UNISEX" },
];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function Navbar({
  logoText,
  announcement,
  categories,
  overlayOnHome,
}: {
  logoText: string;
  announcement: { text: string; link: string } | null;
  categories: NavCategory[];
  overlayOnHome: boolean;
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
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bump, setBump] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const prevCount = useRef(count);

  const overlay = overlayOnHome && pathname === "/";
  const transparent = overlay && !scrolled && !shopOpen && !mobileOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reserve space under the fixed header on every page except the homepage hero.
  useIsoLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    // Measure the full (unscrolled) height only, so content doesn't jump when the header compacts.
    const measure = () => {
      if (window.scrollY < 24) setHeaderHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

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
  const featured = categories.filter((c) => c.image).slice(0, 2);
  const iconBtn = cn(
    "relative rounded-full p-2 transition-colors",
    transparent ? "text-white hover:bg-white/15" : "text-luxury-800 hover:bg-luxury-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
  );
  const linkCls = cn(
    "relative py-2 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100",
    transparent ? "text-white/90 after:bg-white hover:text-white" : "text-luxury-700 after:bg-luxury-900 hover:text-luxury-900 dark:text-zinc-300 dark:after:bg-white dark:hover:text-white",
  );

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-40" onMouseLeave={() => setShopOpen(false)}>
        {announcement && (
          <div
            className={cn(
              "overflow-hidden bg-luxury-900 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-all duration-500 dark:bg-zinc-900",
              scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100",
            )}
          >
            <div className="px-4 py-2">
              {announcement.link ? (
                <Link href={announcement.link} className="hover:underline">
                  {announcement.text}
                </Link>
              ) : (
                announcement.text
              )}
            </div>
          </div>
        )}

        <div
          className={cn(
            "border-b transition-all duration-500",
            transparent ? "border-white/15 bg-gradient-to-b from-black/40 to-transparent" : "glass border-luxury-200/70 shadow-[0_8px_30px_rgb(0_0_0/0.04)] dark:border-zinc-800",
          )}
        >
          <div className={cn("container-page grid grid-cols-[auto_1fr_auto] items-center gap-4 transition-all duration-500 lg:grid-cols-[1fr_auto_1fr]", scrolled ? "h-16" : "h-16 lg:h-20")}>
            <div className="flex items-center gap-1 lg:gap-8">
              <button className={cn(iconBtn, "lg:hidden")} onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <Menu size={22} />
              </button>
              <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
                <button className={cn(linkCls, "flex items-center gap-1")} onMouseEnter={() => setShopOpen(true)} onClick={() => setShopOpen((o) => !o)} aria-expanded={shopOpen}>
                  Shop <ChevronDown size={14} className={cn("transition-transform", shopOpen && "rotate-180")} />
                </button>
                {MAIN_LINKS.slice(0, 3).map((l) => (
                  <Link key={l.href} href={l.href} className={linkCls} onMouseEnter={() => setShopOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Link
              href="/"
              className={cn(
                "truncate whitespace-nowrap text-center font-display text-[13px] font-bold tracking-[0.1em] transition-colors sm:text-lg sm:tracking-[0.18em] lg:text-xl lg:tracking-[0.28em]",
                transparent ? "text-white" : "text-luxury-900 dark:text-white",
              )}
            >
              {logoText}
            </Link>

            <div className="flex items-center justify-end gap-0.5 sm:gap-1 lg:gap-6">
              <nav className="hidden items-center gap-7 xl:flex" aria-label="More">
                {MAIN_LINKS.slice(3).map((l) => (
                  <Link key={l.href} href={l.href} className={linkCls}>
                    {l.label}
                  </Link>
                ))}
              </nav>
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
                <div className="relative hidden sm:block" ref={accountRef}>
                  {user ? (
                    <button className={iconBtn} onClick={() => setAccountOpen((o) => !o)} aria-label="Account menu" aria-expanded={accountOpen}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-fg">{user.name.charAt(0).toUpperCase()}</span>
                    </button>
                  ) : (
                    <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={iconBtn} aria-label="Sign in">
                      <User size={20} />
                    </Link>
                  )}
                  {accountOpen && user && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 animate-slide-down overflow-hidden rounded-lg border border-luxury-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="bg-luxury-50 px-4 py-3 dark:bg-zinc-950">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-luxury-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <MenuLink href="/account" icon={<User size={16} />}>My account</MenuLink>
                        <MenuLink href="/account/orders" icon={<Package size={16} />}>My orders</MenuLink>
                        <MenuLink href="/account/wishlist" icon={<Heart size={16} />}>Wishlist</MenuLink>
                        {isStaff && <MenuLink href="/admin" icon={<LayoutDashboard size={16} />}>Admin dashboard</MenuLink>}
                        <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-luxury-50 dark:hover:bg-zinc-800">
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button className={cn(iconBtn, bump && "animate-pop")} onClick={openDrawer} aria-label={`Shopping bag, ${count} items`}>
                  <ShoppingBag size={20} />
                  {count > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-fg">
                      {count}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <div
          className={cn(
            "absolute inset-x-0 top-full hidden origin-top border-b border-luxury-200 bg-white shadow-2xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 lg:block",
            shopOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="container-page grid grid-cols-[1fr_1fr_1fr_1fr_1.6fr] gap-10 py-10">
            {GROUPS.map((g) => {
              const items = categories.filter((c) => g.match(c.gender));
              if (!items.length) return <div key={g.title} />;
              return (
                <div key={g.title}>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand">{g.title}</p>
                  <ul className="space-y-2.5">
                    {items.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/shop?category=${c.slug}`} className="text-sm text-luxury-700 transition-colors hover:text-luxury-900 dark:text-zinc-300 dark:hover:text-white">
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-4">
              {featured.map((c) => (
                <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden">
                  <SmartImage src={c.image} alt="" className="absolute inset-0" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 text-sm font-medium text-white">
                    {c.name} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-luxury-100 dark:border-zinc-800">
            <div className="container-page flex items-center justify-between py-3 text-sm">
              <Link href="/shop" className="group flex items-center gap-1 font-semibold">
                Shop everything <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/shop?sale=1" className="text-luxury-600 hover:text-luxury-900 dark:text-zinc-400 dark:hover:text-white">
                Sale
              </Link>
            </div>
          </div>
        </div>
      </header>

      {!overlay && (
        <div
          aria-hidden
          className={headerHeight ? undefined : announcement ? "h-[97px] lg:h-[113px]" : "h-16 lg:h-20"}
          style={headerHeight ? { height: headerHeight } : undefined}
        />
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in-left flex-col bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-luxury-100 px-5 py-4 dark:border-zinc-800">
              <span className="truncate font-display text-sm font-bold tracking-[0.18em]">{logoText}</span>
              <button onClick={() => setMobileOpen(false)} className="rounded-full p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Mobile">
              {[{ label: "Shop all", href: "/shop" }, ...MAIN_LINKS].map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex animate-fade-in-up items-center justify-between border-b border-luxury-100 py-4 font-serif text-2xl dark:border-zinc-800"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {l.label} <ArrowRight size={18} className="text-luxury-400" />
                </Link>
              ))}
              <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Categories</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.slice(0, 8).map((c) => (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} className="group relative block aspect-square overflow-hidden rounded-md">
                    <SmartImage src={c.image} alt="" className="absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-sm font-medium text-white">{c.name}</span>
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
                Theme <ThemeToggle className="rounded-full p-2 hover:bg-luxury-100 dark:hover:bg-zinc-800" />
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
    <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-luxury-800 hover:bg-luxury-50 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {icon} {children}
    </Link>
  );
}
