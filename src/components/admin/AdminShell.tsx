"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, Inbox, KeyRound, LogOut, Menu, MessageSquareText, Search, ShoppingCart, X } from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";
import { ADMIN_NAV, isActive, type Badges } from "./nav";

// The admin keeps a consistent, neutral look regardless of the store's Appearance settings.
const ADMIN_VARS = { "--radius-btn": "0.5rem", "--radius-sm": "0.375rem", "--font-sans": "var(--f-inter)" } as React.CSSProperties;

export default function AdminShell({
  user,
  storeName,
  logoImage,
  badges,
  children,
}: {
  user: { name: string; email: string; role: string };
  storeName: string;
  logoImage: string;
  badges: Badges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState<"notifications" | "user" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user.role === "ADMIN";
  const totalAlerts = badges.orders + badges.reviews + badges.messages;
  const current = ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group }))).find((i) => isActive(i.href, pathname));

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/login";
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-4">
        <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-3">
          {logoImage ? (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200 dark:ring-zinc-700">
              <img src={logoImage} alt="" className="max-h-7 max-w-7 object-contain" />
            </span>
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-brand-fg">{storeName.charAt(0)}</span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{storeName}</span>
            <span className="block text-[11px] text-zinc-500">Store admin</span>
          </span>
        </Link>
        <button className="rounded-md p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <div className="px-3 pb-2">
        <button onClick={() => setSearch(true)} className="flex h-9 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600">
          <Search size={15} /> <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border border-zinc-200 bg-white px-1 text-[10px] dark:border-zinc-700 dark:bg-zinc-900">Ctrl K</kbd>
        </button>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3" aria-label="Admin">
        {ADMIN_NAV.map((section) => {
          const items = section.items.filter((i) => !i.adminOnly || isAdmin);
          if (!items.length) return null;
          return (
            <div key={section.group}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{section.group}</p>
              <ul className="space-y-0.5">
                {items.map(({ href, label, icon: Icon, badge }) => {
                  const active = isActive(href, pathname);
                  const count = badge ? badges[badge] : 0;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-zinc-900 font-medium text-white shadow-sm dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={17} className={cn(!active && "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200")} />
                        <span className="flex-1">{label}</span>
                        {count > 0 && <span className={cn("min-w-[20px] rounded-full px-1.5 text-center text-[11px] font-semibold leading-5", active ? "bg-white/20" : "bg-brand text-brand-fg")}>{count}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <ExternalLink size={16} /> View your store
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100" style={ADMIN_VARS}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in-left bg-white shadow-2xl dark:bg-zinc-900">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/85 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/85 sm:px-6">
          <button className="rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            {current && (
              <p className="truncate text-sm text-zinc-500">
                <span className="hidden sm:inline">{current.group} / </span>
                <span className="font-medium text-zinc-900 dark:text-white">{current.label}</span>
              </p>
            )}
          </div>
          <button onClick={() => setSearch(true)} className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden" aria-label="Search">
            <Search size={19} />
          </button>
          <Link href="/" target="_blank" className="hidden h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 sm:inline-flex">
            View store <ExternalLink size={14} />
          </Link>
          <div className="relative flex items-center gap-1" ref={menuRef}>
            <button onClick={() => setMenu(menu === "notifications" ? null : "notifications")} className="relative rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label={`Notifications (${totalAlerts})`} aria-expanded={menu === "notifications"}>
              <Bell size={19} />
              {totalAlerts > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />}
            </button>
            <ThemeToggle className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" />
            <button onClick={() => setMenu(menu === "user" ? null : "user")} className="ml-1 flex items-center gap-2 rounded-full p-0.5 pr-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:pr-3" aria-label="Account menu" aria-expanded={menu === "user"}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950 text-sm font-semibold text-white dark:from-zinc-200 dark:to-white dark:text-zinc-900">{user.name.charAt(0).toUpperCase()}</span>
              <span className="hidden text-left text-sm sm:block">
                <span className="block max-w-[140px] truncate font-medium leading-tight">{user.name}</span>
                <span className="block text-[11px] capitalize leading-tight text-zinc-500">{user.role.toLowerCase()}</span>
              </span>
            </button>

            {menu === "notifications" && (
              <div className="absolute right-0 top-full mt-2 w-80 animate-slide-down overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold dark:border-zinc-800">Needs your attention</p>
                {totalAlerts === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-zinc-500">You’re all caught up. 🎉</p>
                ) : (
                  <ul className="p-1.5">
                    {badges.orders > 0 && <Alert href="/admin/orders?status=CONFIRMED" icon={<ShoppingCart size={16} />} text={`${badges.orders} order${badges.orders === 1 ? "" : "s"} to pack and ship`} />}
                    {badges.reviews > 0 && <Alert href="/admin/reviews" icon={<MessageSquareText size={16} />} text={`${badges.reviews} review${badges.reviews === 1 ? "" : "s"} waiting for approval`} />}
                    {badges.messages > 0 && <Alert href="/admin/messages" icon={<Inbox size={16} />} text={`${badges.messages} unread message${badges.messages === 1 ? "" : "s"}`} />}
                  </ul>
                )}
              </div>
            )}
            {menu === "user" && (
              <div className="absolute right-0 top-full mt-2 w-60 animate-slide-down overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <Link href="/account/security" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"><KeyRound size={16} /> Password & sessions</Link>
                  <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><LogOut size={16} /> Sign out</button>
                </div>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>

      <CommandPalette open={search} onClose={() => setSearch(false)} isAdmin={isAdmin} />
    </div>
  );
}

function Alert({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{icon}</span>
        {text}
      </Link>
    </li>
  );
}
