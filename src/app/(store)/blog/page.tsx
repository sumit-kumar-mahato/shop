import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { EmptyState, SectionHeading } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Journal", description: "Styling guides, fabric care and stories from our studio." };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take: 50 });

  return (
    <div className="container-page py-12">
      <SectionHeading eyebrow="The journal" title="Stories, Style & Craft" />
      {posts.length === 0 ? (
        <EmptyState title="No articles yet" description="Check back soon for styling guides and stories." />
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <article key={p.id} className="group">
              <Link href={`/blog/${p.slug}`}>
                <div className="aspect-[4/3] overflow-hidden bg-luxury-100 dark:bg-zinc-900">
                  {p.coverImage && <img src={p.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-luxury-500">
                    {p.publishedAt && formatDate(p.publishedAt)} · {p.readMinutes} min read
                  </p>
                  <h2 className="font-serif text-2xl leading-snug group-hover:text-brand">{p.title}</h2>
                  <p className="line-clamp-3 text-sm text-luxury-600 dark:text-zinc-400">{p.excerpt}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
