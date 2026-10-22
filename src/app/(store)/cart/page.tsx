import type { Metadata } from "next";
import CartPageClient from "@/components/store/CartPageClient";

export const metadata: Metadata = { title: "Shopping bag", robots: { index: false } };

export default function CartPage() {
  return <CartPageClient />;
}
