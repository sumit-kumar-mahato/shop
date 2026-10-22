import {
  BarChart3,
  FileText,
  FolderTree,
  Gift,
  History,
  Inbox,
  LayoutTemplate,
  Menu,
  MessageSquareText,
  Newspaper,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Badges = { orders: number; reviews: number; messages: number };
export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: keyof Badges; adminOnly?: boolean; keywords?: string };

export const ADMIN_NAV: Array<{ group: string; items: NavItem[] }> = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: BarChart3, keywords: "home stats sales revenue" }],
  },
  {
    group: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "orders", keywords: "ship fulfil invoice return" },
      { href: "/admin/customers", label: "Customers", icon: Users, keywords: "users accounts" },
      { href: "/admin/coupons", label: "Coupons", icon: Tag, keywords: "discount code offer" },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package, keywords: "stock inventory sku" },
      { href: "/admin/categories", label: "Categories", icon: FolderTree, keywords: "collections" },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText, badge: "reviews", keywords: "ratings moderation" },
    ],
  },
  {
    group: "Online store",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate, keywords: "banner hero sections blocks builder" },
      { href: "/admin/appearance", label: "Appearance", icon: Palette, keywords: "theme colour color font logo dark" },
      { href: "/admin/navigation", label: "Menus & footer", icon: Menu, keywords: "navigation header links" },
      { href: "/admin/product-page", label: "Product page", icon: ShoppingBag, keywords: "size guide highlights" },
      { href: "/admin/engagement", label: "Popups & chat", icon: Gift, keywords: "whatsapp popup welcome newsletter" },
      { href: "/admin/pages", label: "About & policies", icon: FileText, keywords: "privacy terms shipping returns" },
      { href: "/admin/blog", label: "Journal / blog", icon: Newspaper, keywords: "posts articles" },
    ],
  },
  {
    group: "Inbox",
    items: [{ href: "/admin/messages", label: "Messages", icon: Inbox, badge: "messages", keywords: "contact subscribers newsletter" }],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/settings", label: "Store settings", icon: Settings, adminOnly: true, keywords: "payments tax gst shipping contact razorpay" },
      { href: "/admin/activity", label: "Activity log", icon: History, adminOnly: true, keywords: "audit history" },
    ],
  },
];

export function isActive(href: string, pathname: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
