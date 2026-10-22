import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth/session";
import { formatDate, textBlocks } from "@/lib/utils";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || !post.isPublished) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: post.coverImage ? [post.coverImage] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post) notFound();
  if (!post.isPublished && !isStaff(await getCurrentUser())) notFound();

  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/blog" className="mb-8 inline-flex items-center gap-1 text-sm text-luxury-600 hover:underline dark:text-zinc-400">
        <ArrowLeft size={14} /> All articles
      </Link>
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-luxury-500">
          {post.publishedAt ? formatDate(post.publishedAt, { day: "numeric", month: "long", year: "numeric" }) : "Draft"} · {post.readMinutes} min read · {post.authorName}
        </p>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
        <p className="text-lg text-luxury-600 dark:text-zinc-400">{post.excerpt}</p>
      </header>
      {post.coverImage && (
        <div className="my-10 aspect-[16/9] overflow-hidden bg-luxury-100">
          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="prose-store text-base">
        {textBlocks(post.content).map((b, i) => (b.type === "h" ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>))}
      </div>
      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-luxury-100 px-3 py-1 text-xs dark:bg-zinc-800">#{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}
