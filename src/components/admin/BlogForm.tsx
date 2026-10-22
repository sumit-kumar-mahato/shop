"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/admin/ui";
import { SingleImageField } from "@/components/admin/ImageUploader";
import { api, errorMessage, FetchError } from "@/lib/fetcher";
import { slugify } from "@/lib/utils";

export type BlogValues = { id?: string; title: string; slug: string; excerpt: string; content: string; coverImage: string; tags: string; authorName: string; readMinutes: number; isPublished: boolean };

export default function BlogForm({ initial }: { initial: BlogValues }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const isEdit = Boolean(initial.id);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFields({});
    const words = v.content.trim().split(/\s+/).length;
    const body = {
      ...v,
      slug: v.slug || slugify(v.title),
      coverImage: v.coverImage || null,
      tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readMinutes: v.readMinutes || Math.max(1, Math.round(words / 200)),
    };
    delete (body as { id?: string }).id;
    try {
      const res = isEdit
        ? await api<{ post: { id: string } }>(`/api/admin/blog/${initial.id}`, { method: "PATCH", body })
        : await api<{ post: { id: string } }>("/api/admin/blog", { body });
      toast("Article saved");
      if (!isEdit) router.replace(`/admin/blog/${res.post.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await api(`/api/admin/blog/${initial.id}`, { method: "DELETE" });
      toast("Article deleted");
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <FormError message={error} />
        <Panel>
          <div className="space-y-4">
            <Field label="Title" htmlFor="b-title" error={fields.title}>
              <Input id="b-title" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value, slug: isEdit ? v.slug : slugify(e.target.value) })} required />
            </Field>
            <Field label="URL" htmlFor="b-slug" error={fields.slug} hint={`/blog/${v.slug || "…"}`}>
              <Input id="b-slug" value={v.slug} onChange={(e) => setV({ ...v, slug: slugify(e.target.value) })} required />
            </Field>
            <Field label="Summary" htmlFor="b-excerpt" error={fields.excerpt} hint="Shown on the Journal page and in search results">
              <Textarea id="b-excerpt" rows={2} value={v.excerpt} onChange={(e) => setV({ ...v, excerpt: e.target.value })} required />
            </Field>
            <Field label="Article" htmlFor="b-content" error={fields.content} hint="Leave a blank line between paragraphs. Start a line with ## for a heading.">
              <Textarea id="b-content" rows={18} value={v.content} onChange={(e) => setV({ ...v, content: e.target.value })} required />
            </Field>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Publish">
          <div className="space-y-4">
            <Checkbox label="Published (visible on the site)" checked={v.isPublished} onChange={(e) => setV({ ...v, isPublished: e.target.checked })} />
            <Button type="submit" fullWidth loading={saving}>{isEdit ? "Save article" : "Create article"}</Button>
            {isEdit && (
              <div className="flex justify-between text-sm">
                <Link href={`/blog/${v.slug}`} target="_blank" className="flex items-center gap-1 hover:underline"><Eye size={14} /> Preview</Link>
                <button type="button" onClick={remove} className="flex items-center gap-1 text-red-600 hover:underline"><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        </Panel>
        <Panel title="Cover image">
          <SingleImageField value={v.coverImage} onChange={(coverImage) => setV({ ...v, coverImage })} aspect="aspect-[4/3]" />
        </Panel>
        <Panel title="Details">
          <div className="space-y-4">
            <Field label="Author" htmlFor="b-author"><Input id="b-author" value={v.authorName} onChange={(e) => setV({ ...v, authorName: e.target.value })} required /></Field>
            <Field label="Read time (minutes)" htmlFor="b-read" hint="0 = calculate automatically">
              <Input id="b-read" type="number" min={0} max={120} value={v.readMinutes} onChange={(e) => setV({ ...v, readMinutes: parseInt(e.target.value, 10) || 0 })} />
            </Field>
            <Field label="Tags" htmlFor="b-tags" hint="Comma-separated"><Input id="b-tags" value={v.tags} onChange={(e) => setV({ ...v, tags: e.target.value })} /></Field>
          </div>
        </Panel>
      </div>
    </form>
  );
}
