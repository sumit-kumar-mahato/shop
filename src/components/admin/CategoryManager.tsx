"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { Panel, Table, Td, Th } from "@/components/admin/ui";
import { SingleImageField } from "@/components/admin/ImageUploader";
import { api, errorMessage } from "@/lib/fetcher";
import { slugify } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; description: string; image: string; gender: string; sortOrder: number; isActive: boolean; productCount: number };
const blank: Omit<Cat, "id" | "productCount"> = { name: "", slug: "", description: "", image: "", gender: "", sortOrder: 0, isActive: true };

export default function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<(Omit<Cat, "id" | "productCount"> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    const body = { ...editing, slug: editing.slug || slugify(editing.name), gender: editing.gender || null, image: editing.image || null, description: editing.description || null };
    try {
      if (editing.id) await api(`/api/admin/categories/${editing.id}`, { method: "PATCH", body });
      else await api("/api/admin/categories", { body });
      toast("Category saved");
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Cat) => {
    if (!confirm(`Delete "${c.name}"? ${c.productCount ? `Its ${c.productCount} products will stay in the store without a category.` : ""}`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      toast("Category deleted");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return (
    <>
      <Panel
        padded={false}
        actions={
          <Button size="sm" onClick={() => setEditing({ ...blank })}>
            <Plus size={16} /> Add category
          </Button>
        }
        title={`${initial.length} categories`}
      >
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>For</Th>
              <Th>Products</Th>
              <Th>Order</Th>
              <Th>Visible</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">{c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}</div>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-zinc-500">/{c.slug}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-zinc-500">{c.gender ? c.gender.charAt(0) + c.gender.slice(1).toLowerCase() : "All"}</Td>
                <Td>{c.productCount}</Td>
                <Td>{c.sortOrder}</Td>
                <Td>{c.isActive ? <Badge tone="green">Visible</Badge> : <Badge>Hidden</Badge>}</Td>
                <Td className="whitespace-nowrap text-right">
                  <button onClick={() => setEditing({ ...c })} className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label={`Edit ${c.name}`}><Pencil size={16} /></button>
                  <button onClick={() => remove(c)} className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {initial.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No categories yet.</p>}
      </Panel>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit category" : "New category"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <FormError message={error} />
            <Field label="Name" htmlFor="cat-name">
              <Input id="cat-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="URL slug" htmlFor="cat-slug" hint={`/shop?category=${editing.slug || "…"}`}>
              <Input id="cat-slug" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </Field>
            <Field label="Description (optional)" htmlFor="cat-desc">
              <Textarea id="cat-desc" rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="For" htmlFor="cat-gender">
                <Select id="cat-gender" value={editing.gender} onChange={(e) => setEditing({ ...editing, gender: e.target.value })}>
                  <option value="">Everyone</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                  <option value="UNISEX">Unisex</option>
                </Select>
              </Field>
              <Field label="Display order" htmlFor="cat-order" hint="Lower numbers show first">
                <Input id="cat-order" type="number" min={0} value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value, 10) || 0 })} />
              </Field>
            </div>
            <Field label="Cover image">
              <SingleImageField value={editing.image} onChange={(image) => setEditing({ ...editing, image })} aspect="aspect-[4/3]" />
            </Field>
            <Checkbox label="Visible in the store" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
          </div>
        )}
      </Modal>
    </>
  );
}
