import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { describeCoupon } from "@/lib/coupons";
import { formatDate } from "@/lib/utils";
import { getProductCards } from "@/lib/catalog";
import { EmptyState, SectionHeading } from "@/components/ui/Misc";
import { ProductGrid } from "@/components/store/ProductCard";
import CopyCode from "./CopyCode";

export const metadata: Metadata = { title: "Offers & coupons", description: "Current discount codes and products on sale." };

export default async function OffersPage() {
  const now = new Date();
  const [coupons, onSale] = await Promise.all([
    prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
      },
      orderBy: { createdAt: "desc" },
    }),
    getProductCards({ compareAtPrice: { not: null } }, { take: 8, orderBy: [{ salesCount: "desc" }] }),
  ]);
  const available = coupons.filter((c) => c.usageLimit == null || c.usageCount < c.usageLimit);

  return (
    <div className="container-page space-y-20 py-12">
      <section>
        <SectionHeading eyebrow="Save more" title="Offers & Coupons" />
        {available.length === 0 ? (
          <EmptyState icon={<Tag size={40} />} title="No coupons right now" description="Subscribe to our newsletter to hear about the next offer first." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((c) => (
              <div key={c.id} className="relative overflow-hidden rounded-sm border-2 border-dashed border-brand bg-white p-6 dark:bg-zinc-900">
                <p className="font-serif text-3xl">{c.type === "PERCENTAGE" ? `${c.value}% OFF` : `₹${(c.value / 100).toLocaleString("en-IN")} OFF`}</p>
                <p className="mt-2 text-sm text-luxury-600 dark:text-zinc-400">{c.description || describeCoupon(c)}</p>
                {c.expiresAt && <p className="mt-1 text-xs text-luxury-500">Valid until {formatDate(c.expiresAt)}</p>}
                <CopyCode code={c.code} />
              </div>
            ))}
          </div>
        )}
      </section>

      {onSale.length > 0 && (
        <section>
          <SectionHeading eyebrow="Marked down" title="On Sale Now" />
          <ProductGrid products={onSale} />
        </section>
      )}
    </div>
  );
}
