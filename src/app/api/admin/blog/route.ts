import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { blogInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const POST = route(async (req) => {
  const staff = await requireStaff();
  const input = await parseJson(req, blogInputSchema);
  const post = await prisma.blogPost.create({
    data: { ...input, coverImage: input.coverImage ?? null, publishedAt: input.isPublished ? new Date() : null },
  });
  await audit(staff.id, "blog.create", "BlogPost", post.id, { title: post.title });
  return ok({ post }, { status: 201 });
});
