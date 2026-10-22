"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  FileText,
  FolderTree,
  History,
  Home,
  Inbox,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareText,
  Newspaper,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/store/ThemeToggle";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

type Badges = { orders: number; reviews: number; messages: number };

const NAV: Array<{ group: string; items: Array<{ href: string; label: string; icon: typeof Home; badge?: keyof Badges; adminOnly?: boolean }> }> = [
  {
    group: "Store",
    items: [
      { href: "/admin", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "orders" },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/coupons", label: "Coupons", icon: Tag },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText, badge: "reviews" },
      { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "messages" },
    ],
  },
  {
    group: "Website",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate },
      { href: "/admin/pages", label: "About & policies", icon: FileText },
      { href: "/admin/blog", label: "Journal / blog", icon: Newspaper },
      { href: "/admin/settings", label: "Store settings", icon: Settings, adminOnly: true },
      { href: "/admin/activity", label: "Activity log", icon: History, adminOnly: true },
    ],
  },
];

export default function AdminShell({
  user,
  storeName,
  badges,
  children,
}: {
  user: { name: string; email: string; role: string };
  storeName: string;
  badges: Badges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/login";
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
        <Link href="/admin" className="truncate font-display text-sm font-bold tracking-[0.15em]">
          {storeName}
        </Link>
        <button className="rounded p-1.5 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
        {NAV.map((section) => (
          <div key={section.group}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{section.group}</p>
            <ul className="space-y-0.5">
              {section.items
                .filter((i) => !i.adminOnly || user.role === "ADMIN")
                .map(({ href, label, icon: Icon, badge }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  const count = badge ? badges[badge] : 0;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          active ? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={17} />
                        <span className="flex-1">{label}</span>
                        {count > 0 && (
                          <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", active ? "bg-white/20" : "bg-brand text-brand-fg")}>{count}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Home size={17} /> View store <ExternalLink size={12} className="ml-auto" />
        </Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in-left bg-white dark:bg-zinc-900">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 sm:px-6">
          <button className="rounded p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <ThemeToggle className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" />
          <Link href="/account/security" className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-fg">{user.name.charAt(0).toUpperCase()}</span>
            <span className="hidden text-left text-sm sm:block">
              <span className="block font-medium leading-tight">{user.name}</span>
              <span className="block text-xs capitalize text-zinc-500">{user.role.toLowerCase()}</span>
            </span>
          </Link>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
