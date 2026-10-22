import Link from "next/link";
import type { ReviewStatus } from "@prisma/client";
import { BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminPagination, PageHeader, Panel, withParams } from "@/components/admin/ui";
import { Badge, Stars } from "@/components/ui/Misc";
import ReviewActions from "@/components/admin/ReviewActions";
import { cn } from "@/lib/utils";

export const metadata = { title: "Reviews" };
const PER_PAGE = 20;
const TABS: Array<{ label: string; status: ReviewStatus }> = [
  { label: "Pending", status: "PENDING" },
  { label: "Approved", status: "APPROVED" },
  { label: "Rejected", status: "REJECTED" },
];

export default async function AdminReviews({ searchParams }: { searchParams: { status?: string; page?: string } }) {
  const status = (TABS.find((t) => t.status === searchParams.status)?.status ?? "PENDING") as ReviewStatus;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const [total, reviews, counts] = await Promise.all([
    prisma.review.count({ where: { status } }),
    prisma.review.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { name: true, email: true } }, product: { select: { title: true, slug: true, images: true } } },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s: ReviewStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <div>
      <PageHeader title="Reviews" description="Approve reviews before they appear on product pages." />
      <div className="mb-4 flex gap-1">
        {TABS.map((t) => (
          <Link
            key={t.status}
            href={`/admin/reviews?status=${t.status}`}
            className={cn("rounded-full px-3 py-1.5 text-sm", status === t.status ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800")}
          >
            {t.label} ({count(t.status)})
          </Link>
        ))}
      </div>
      <Panel padded={false}>
        {reviews.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No {status.toLowerCase()} reviews.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reviews.map((r) => (
              <li key={r.id} className="flex flex-col gap-4 p-5 sm:flex-row">
                <Link href={`/product/${r.product.slug}`} target="_blank" className="flex w-full flex-shrink-0 gap-3 sm:w-56">
                  <div className="h-14 w-11 flex-shrink-0 overflow-hidden rounded bg-zinc-100">{r.product.images[0] && <img src={r.product.images[0]} alt="" className="h-full w-full object-cover" />}</div>
                  <span className="text-sm font-medium hover:underline">{r.product.title}</span>
                </Link>
                <div className="flex-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={r.rating} />
                    {r.title && <span className="font-semibold">{r.title}</span>}
                    {r.isVerifiedPurchase && <Badge tone="green"><BadgeCheck size={12} /> Verified buyer</Badge>}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-zinc-700 dark:text-zinc-300">{r.comment}</p>
                  <p className="mt-2 text-xs text-zinc-500">{r.user.name} · {r.user.email} · {formatDate(r.createdAt)}</p>
                </div>
                <ReviewActions id={r.id} status={r.status} />
              </li>
            ))}
          </ul>
        )}
        <AdminPagination page={page} pageCount={Math.ceil(total / PER_PAGE)} baseHref={(p) => withParams("/admin/reviews", { status }, { page: p })} />
      </Panel>
    </div>
  );
}
