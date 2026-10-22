import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUserPage } from "@/lib/auth/session";
import { cardInclude, toCard } from "@/lib/catalog";
import { EmptyState } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";
import { ProductGrid } from "@/components/store/ProductCard";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const user = await requireUserPage("/account/wishlist");
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id, product: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    include: { product: { include: cardInclude } },
  });

  if (items.length === 0) {
    return <EmptyState icon={<Heart size={40} />} title="Your wishlist is empty" description="Tap the heart on any product to save it for later." action={<LinkButton href="/shop">Browse products</LinkButton>} />;
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl">Wishlist ({items.length})</h2>
      <ProductGrid products={items.map((i) => toCard(i.product))} className="lg:grid-cols-3" />
    </div>
  );
}
