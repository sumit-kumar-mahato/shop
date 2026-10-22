import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = { title: "Edit article" };

export default async function EditBlogPost({ params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();
  return (
    <div>
      <PageHeader title="Edit article" back={{ href: "/admin/blog", label: "Journal" }} />
      <BlogForm
        key={post.updatedAt.toISOString()}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? "",
          tags: post.tags.join(", "),
          authorName: post.authorName,
          readMinutes: post.readMinutes,
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}
