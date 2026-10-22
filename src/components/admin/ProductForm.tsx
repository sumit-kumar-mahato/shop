"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/admin/ui";
import { ImageListEditor } from "@/components/admin/ImageUploader";
import { api, errorMessage, FetchError } from "@/lib/fetcher";
import { toPaise } from "@/lib/money";
import { slugify } from "@/lib/utils";

type Gender = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
type Status = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type VariantRow = { key: string; id?: string; sku: string; size: string; color: string; colorHex: string; stock: string; price: string; isActive: boolean };

export type ProductFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  gender: Gender;
  price: string;
  compareAtPrice: string;
  images: string[];
  fabric: string;
  fit: string;
  careInstructions: string;
  tags: string;
  status: Status;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  seoTitle: string;
  seoDescription: string;
  variants: VariantRow[];
};

const COMMON_COLORS: Record<string, string> = {
  black: "#000000", white: "#FFFFFF", red: "#DC2626", maroon: "#7F1D1D", pink: "#EC4899", blue: "#1D4ED8", navy: "#1E3A8A",
  green: "#15803D", olive: "#556B2F", yellow: "#EAB308", mustard: "#D4A017", orange: "#EA580C", purple: "#7C3AED",
  grey: "#6B7280", gray: "#6B7280", charcoal: "#374151", beige: "#E8DCC4", cream: "#F5F0E1", brown: "#78350F", gold: "#C5A880", indigo: "#312E81",
};

let keyCounter = 0;
const newKey = () => `v${Date.now()}${keyCounter++}`;

export default function ProductForm({ initial, categories }: { initial: ProductFormValues; categories: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState<ProductFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [genSizes, setGenSizes] = useState("S, M, L, XL");
  const [genColors, setGenColors] = useState("Black, White");
  const [genStock, setGenStock] = useState("10");
  const isEdit = Boolean(initial.id);

  const set = <K extends keyof ProductFormValues>(k: K, value: ProductFormValues[K]) => setV((prev) => ({ ...prev, [k]: value }));

  const skuBase = useMemo(() => (v.slug || slugify(v.title)).toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 24).replace(/-$/, ""), [v.slug, v.title]);

  const generate = () => {
    const sizes = genSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colors = genColors.split(",").map((s) => s.trim()).filter(Boolean);
    if (!sizes.length || !colors.length) return toast("Enter at least one size and one colour", "error");
    const existing = new Set(v.variants.map((r) => `${r.size.toLowerCase()}|${r.color.toLowerCase()}`));
    const rows: VariantRow[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        if (existing.has(`${size.toLowerCase()}|${color.toLowerCase()}`)) continue;
        rows.push({
          key: newKey(),
          sku: `${skuBase || "SKU"}-${color.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}-${size.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`,
          size,
          color,
          colorHex: COMMON_COLORS[color.toLowerCase()] ?? "#999999",
          stock: genStock || "0",
          price: "",
          isActive: true,
        });
      }
    }
    set("variants", [...v.variants, ...rows]);
    if (!rows.length) toast("Those combinations already exist", "info");
  };

  const updateRow = (key: string, patch: Partial<VariantRow>) => set("variants", v.variants.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const save = async (status?: Status) => {
    setSaving(true);
    setError(null);
    setFields({});
    const payload = {
      title: v.title,
      slug: v.slug || slugify(v.title),
      description: v.description,
      categoryId: v.categoryId || null,
      gender: v.gender,
      price: toPaise(v.price),
      compareAtPrice: v.compareAtPrice ? toPaise(v.compareAtPrice) : null,
      images: v.images,
      fabric: v.fabric,
      fit: v.fit,
      careInstructions: v.careInstructions,
      tags: v.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      status: status ?? v.status,
      isFeatured: v.isFeatured,
      isNewArrival: v.isNewArrival,
      isBestSeller: v.isBestSeller,
      isTrending: v.isTrending,
      isFlashSale: v.isFlashSale,
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      variants: v.variants.map((r) => ({
        id: r.id,
        sku: r.sku,
        size: r.size,
        color: r.color,
        colorHex: r.colorHex || null,
        stock: parseInt(r.stock, 10) || 0,
        price: r.price ? toPaise(r.price) : null,
        isActive: r.isActive,
      })),
    };
    try {
      const res = isEdit
        ? await api<{ product: { id: string } }>(`/api/admin/products/${initial.id}`, { method: "PATCH", body: payload })
        : await api<{ product: { id: string } }>("/api/admin/products", { body: payload });
      toast(isEdit ? "Product saved" : "Product created");
      if (status) set("status", status);
      if (!isEdit) router.replace(`/admin/products/${res.product.id}`);
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const totalStock = v.variants.reduce((s, r) => s + (parseInt(r.stock, 10) || 0), 0);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-6"
    >
      <FormError message={error} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Basic information">
            <div className="grid gap-4">
              <Field label="Title" htmlFor="title" error={fields.title}>
                <Input
                  id="title"
                  value={v.title}
                  onChange={(e) => {
                    set("title", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                  required
                  placeholder="e.g. Classic White Linen Shirt"
                />
              </Field>
              <Field label="URL" htmlFor="slug" error={fields.slug} hint={`Product address: /product/${v.slug || "…"}`}>
                <Input
                  id="slug"
                  value={v.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                  required
                />
              </Field>
              <Field label="Description" htmlFor="desc" error={fields.description} hint="Use a blank line between paragraphs. Start a line with ## for a heading.">
                <Textarea id="desc" value={v.description} onChange={(e) => set("description", e.target.value)} rows={7} />
              </Field>
            </div>
          </Panel>

          <Panel title="Images" description={fields.images}>
            <ImageListEditor images={v.images} onChange={(imgs) => set("images", imgs)} />
          </Panel>

          <Panel title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Selling price (₹)" htmlFor="price" error={fields.price}>
                <Input id="price" type="number" min={1} step="0.01" value={v.price} onChange={(e) => set("price", e.target.value)} required />
              </Field>
              <Field label="Original price / MRP (₹)" htmlFor="cmp" error={fields.compareAtPrice} hint="Optional. Shown struck-through to display a discount.">
                <Input id="cmp" type="number" min={0} step="0.01" value={v.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Sizes, colours & stock" description={`${v.variants.length} variants · ${totalStock} units in stock`}>
            <div className="mb-5 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Wand2 size={16} /> Quick add — create every size × colour combination</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto]">
                <Input value={genSizes} onChange={(e) => setGenSizes(e.target.value)} placeholder="Sizes: S, M, L, XL" aria-label="Sizes" className="h-10" />
                <Input value={genColors} onChange={(e) => setGenColors(e.target.value)} placeholder="Colours: Black, White" aria-label="Colours" className="h-10" />
                <Input type="number" min={0} value={genStock} onChange={(e) => setGenStock(e.target.value)} aria-label="Stock each" className="h-10" />
                <Button type="button" size="sm" variant="secondary" className="h-10" onClick={generate}>Generate</Button>
              </div>
            </div>
            {fields.variants && <p className="mb-3 text-sm text-red-600">{fields.variants}</p>}
            {v.variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                      <th className="pb-2 pr-2">Size</th>
                      <th className="pb-2 pr-2">Colour</th>
                      <th className="pb-2 pr-2">SKU</th>
                      <th className="w-24 pb-2 pr-2">Stock</th>
                      <th className="w-28 pb-2 pr-2">Price ₹ <span className="normal-case">(optional)</span></th>
                      <th className="pb-2 pr-2">On sale</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {v.variants.map((r, i) => {
                      const err = (f: string) => fields[`variants.${i}.${f}`];
                      return (
                        <tr key={r.key} className="align-top">
                          <td className="py-1 pr-2"><Input className="h-9" value={r.size} onChange={(e) => updateRow(r.key, { size: e.target.value })} invalid={!!err("size")} title={err("size")} /></td>
                          <td className="py-1 pr-2">
                            <div className="flex gap-1">
                              <input type="color" value={r.colorHex || "#999999"} onChange={(e) => updateRow(r.key, { colorHex: e.target.value.toUpperCase() })} className="h-9 w-9 flex-shrink-0 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700" aria-label="Colour swatch" />
                              <Input className="h-9" value={r.color} onChange={(e) => updateRow(r.key, { color: e.target.value })} invalid={!!err("color")} />
                            </div>
                          </td>
                          <td className="py-1 pr-2"><Input className="h-9 font-mono text-xs uppercase" value={r.sku} onChange={(e) => updateRow(r.key, { sku: e.target.value.toUpperCase() })} invalid={!!err("sku")} title={err("sku")} /></td>
                          <td className="py-1 pr-2"><Input className="h-9" type="number" min={0} value={r.stock} onChange={(e) => updateRow(r.key, { stock: e.target.value })} /></td>
                          <td className="py-1 pr-2"><Input className="h-9" type="number" min={0} step="0.01" value={r.price} onChange={(e) => updateRow(r.key, { price: e.target.value })} placeholder={v.price || "—"} /></td>
                          <td className="py-1 pr-2 pt-3"><input type="checkbox" checked={r.isActive} onChange={(e) => updateRow(r.key, { isActive: e.target.checked })} aria-label="Available for sale" /></td>
                          <td className="py-1">
                            <button type="button" onClick={() => set("variants", v.variants.filter((x) => x.key !== r.key))} className="rounded p-2 text-zinc-400 hover:text-red-600" aria-label="Remove variant">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("variants", [...v.variants, { key: newKey(), sku: `${skuBase}-${v.variants.length + 1}`, size: "", color: "", colorHex: "#999999", stock: "0", price: "", isActive: true }])}
              >
                <Plus size={14} /> Add row
              </Button>
              {v.variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const n = prompt("Set stock for every variant to:");
                    if (n !== null && /^\d+$/.test(n.trim())) set("variants", v.variants.map((r) => ({ ...r, stock: n.trim() })));
                  }}
                >
                  Set all stock…
                </Button>
              )}
            </div>
          </Panel>

          <Panel title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fabric" htmlFor="fabric"><Input id="fabric" value={v.fabric} onChange={(e) => set("fabric", e.target.value)} placeholder="e.g. 100% Linen" /></Field>
              <Field label="Fit" htmlFor="fit"><Input id="fit" value={v.fit} onChange={(e) => set("fit", e.target.value)} placeholder="e.g. Slim fit" /></Field>
              <Field label="Care instructions" htmlFor="care" className="sm:col-span-2"><Input id="care" value={v.careInstructions} onChange={(e) => set("careInstructions", e.target.value)} placeholder="e.g. Machine wash cold, do not bleach" /></Field>
              <Field label="Search tags" htmlFor="tags" hint="Comma-separated words customers might search for" className="sm:col-span-2">
                <Input id="tags" value={v.tags} onChange={(e) => set("tags", e.target.value)} placeholder="linen, summer, formal" />
              </Field>
            </div>
          </Panel>

          <Panel title="Search engine listing" description="Optional — defaults to the title and description.">
            <div className="grid gap-4">
              <Field label="SEO title" htmlFor="seot"><Input id="seot" value={v.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} maxLength={120} /></Field>
              <Field label="SEO description" htmlFor="seod"><Textarea id="seod" value={v.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} rows={2} maxLength={300} /></Field>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Status">
            <Select value={v.status} onChange={(e) => set("status", e.target.value as Status)} aria-label="Status">
              <option value="ACTIVE">Active — visible in store</option>
              <option value="DRAFT">Draft — hidden</option>
              <option value="ARCHIVED">Archived — hidden</option>
            </Select>
            {isEdit && (
              <Link href={`/product/${v.slug}`} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm hover:underline">
                <Eye size={14} /> Preview on store
              </Link>
            )}
          </Panel>
          <Panel title="Organisation">
            <div className="space-y-4">
              <Field label="Category" htmlFor="cat">
                <Select id="cat" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="For" htmlFor="gender">
                <Select id="gender" value={v.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="KIDS">Kids</option>
                  <option value="UNISEX">Unisex</option>
                </Select>
              </Field>
            </div>
          </Panel>
          <Panel title="Homepage placement" description="Choose where this product is highlighted">
            <div className="space-y-3">
              <Checkbox label="New arrival" checked={v.isNewArrival} onChange={(e) => set("isNewArrival", e.target.checked)} />
              <Checkbox label="Best seller" checked={v.isBestSeller} onChange={(e) => set("isBestSeller", e.target.checked)} />
              <Checkbox label="Featured" checked={v.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
              <Checkbox label="Trending" checked={v.isTrending} onChange={(e) => set("isTrending", e.target.checked)} />
              <Checkbox label="Flash sale" checked={v.isFlashSale} onChange={(e) => set("isFlashSale", e.target.checked)} />
            </div>
          </Panel>
          <div className="sticky bottom-4 flex gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <Button type="submit" fullWidth loading={saving}>{isEdit ? "Save changes" : "Create product"}</Button>
            {!isEdit && (
              <Button type="button" variant="outline" onClick={() => save("DRAFT")} disabled={saving}>
                Save draft
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
