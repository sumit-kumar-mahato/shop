import { requireStaffPage } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import BlogForm from "@/components/admin/BlogForm";

export const metadata = { title: "New article" };

export default async function NewBlogPost() {
  const user = await requireStaffPage();
  return (
    <div>
      <PageHeader title="New article" back={{ href: "/admin/blog", label: "Journal" }} />
      <BlogForm initial={{ title: "", slug: "", excerpt: "", content: "", coverImage: "", tags: "", authorName: user.name, readMinutes: 0, isPublished: false }} />
    </div>
  );
}
