import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { blogInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const input = await parseJson(req, blogInputSchema);
  const existing = await prisma.blogPost.findUniqueOrThrow({ where: { id: params.id } });
  const post = await prisma.blogPost.update({
    where: { id: existing.id },
    data: {
      ...input,
      coverImage: input.coverImage ?? null,
      publishedAt: input.isPublished ? existing.publishedAt ?? new Date() : null,
    },
  });
  await audit(staff.id, "blog.update", "BlogPost", post.id, { title: post.title });
  return ok({ post });
});

export const DELETE = route(async (_req, { params }) => {
  const staff = await requireStaff();
  const post = await prisma.blogPost.delete({ where: { id: params.id } });
  await audit(staff.id, "blog.delete", "BlogPost", post.id, { title: post.title });
  return ok({ success: true });
});
