"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ListOrdered,
  Tag,
  Palette,
  Settings,
  Eye,
  LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products Manager", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders Manager", href: "/admin/orders", icon: ListOrdered },
    { name: "Coupons Discounts", href: "/admin/coupons", icon: Tag },
    { name: "Visual Homepage Editor", href: "/admin/content", icon: Palette },
    { name: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans pt-16">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between flex-shrink-0">
        <div className="py-6 px-4 space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-luxury-gold tracking-widest uppercase">Visual Store Admin</span>
            <p className="text-xs text-zinc-400 font-light">Manage catalogue & content visually.</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-luxury-gold/15 via-luxury-gold/5 to-transparent text-luxury-gold border-l-2 border-luxury-gold pl-3"
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white hover:pl-5"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-luxury-gold" : "text-zinc-500 group-hover:text-white"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs tracking-wider py-2.5 rounded transition-all uppercase"
          >
            <Eye size={14} /> Live Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
