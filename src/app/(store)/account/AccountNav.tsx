"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Shield, User } from "lucide-react";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/security", label: "Security", icon: Shield },
];

export default function AccountNav({ isStaff }: { isStaff: boolean }) {
  const pathname = usePathname();
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/";
  };

  return (
    <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
              active ? "bg-luxury-900 font-semibold text-white dark:bg-white dark:text-zinc-900" : "text-luxury-700 hover:bg-luxury-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={16} /> {label}
          </Link>
        );
      })}
      {isStaff && (
        <Link href="/admin" className="flex flex-shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-luxury-700 hover:bg-luxury-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <LayoutDashboard size={16} /> Admin
        </Link>
      )}
      <button onClick={logout} className="flex flex-shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
        <LogOut size={16} /> Sign out
      </button>
    </nav>
  );
}
