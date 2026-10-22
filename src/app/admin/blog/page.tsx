import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader, Panel, Table, Td, Th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Misc";
import { LinkButton } from "@/components/ui/Button";

export const metadata = { title: "Journal" };

export default async function AdminBlog() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <PageHeader
        title="Journal / blog"
        description="Articles shown on the Journal page."
        actions={
          <LinkButton href="/admin/blog/new" size="sm">
            <Plus size={16} /> New article
          </LinkButton>
        }
      />
      <Panel padded={false}>
        {posts.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">No articles yet.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Author</Th>
                <Th>Published</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td><Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">{p.title}</Link></Td>
                  <Td>{p.isPublished ? <Badge tone="green">Published</Badge> : <Badge tone="amber">Draft</Badge>}</Td>
                  <Td className="text-zinc-500">{p.authorName}</Td>
                  <Td className="text-zinc-500">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
