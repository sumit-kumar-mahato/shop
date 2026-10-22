"use client";

import { BadgeCheck, LayoutPanelTop, Plus, Ruler, Trash2 } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Form";
import EditorShell, { type PreviewPath } from "@/components/admin/EditorShell";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { EditorSection, IconBtn, IconPicker, ListEditor, Toggle } from "@/components/admin/fields";
import type { ProductPageSettings } from "@/lib/settings-schema";

export default function ProductPageEditor({ initial, previewPaths }: { initial: ProductPageSettings; previewPaths: PreviewPath[] }) {
  const form = useSettingsForm("productPage", initial);
  const v = form.value;
  const set = <K extends keyof ProductPageSettings>(k: K, val: ProductPageSettings[K]) => form.setValue({ ...v, [k]: val });
  const g = v.sizeGuide;
  const setGuide = (patch: Partial<ProductPageSettings["sizeGuide"]>) => set("sizeGuide", { ...g, ...patch });

  return (
    <EditorShell {...form} onSave={() => void form.save()} onReset={form.reset} previewPaths={previewPaths}>
      <EditorSection title="Buy box" description="Information shown under the Add to bag button" icon={<BadgeCheck size={18} />}>
        <Toggle label="Delivery, returns and Cash on Delivery info" hint="Uses the delivery estimate, return window and payment options from Store settings." checked={v.showDeliveryInfo} onChange={(x) => set("showDeliveryInfo", x)} />
        <Field label="Extra highlights" hint="Short promises with an icon, e.g. “Handwoven in Varanasi”.">
          <ListEditor
            items={v.highlights}
            onChange={(highlights) => set("highlights", highlights)}
            create={(): ProductPageSettings["highlights"][number] => ({ icon: "sparkles", text: "" })}
            max={6}
            addLabel="Add highlight"
            compact
            render={(h, update) => (
              <div className="flex gap-2">
                <IconPicker value={h.icon} onChange={(icon) => update({ icon })} />
                <Input className="h-10" value={h.text} onChange={(e) => update({ text: e.target.value })} placeholder="Highlight text" aria-label="Highlight text" />
              </div>
            )}
          />
        </Field>
        <Toggle label="“Share this product” button" checked={v.showShare} onChange={(x) => set("showShare", x)} />
      </EditorSection>

      <EditorSection title="Size guide" description="The table customers see when they tap “Size guide”" icon={<Ruler size={18} />}>
        <Toggle label="Show size guide" checked={g.enabled} onChange={(enabled) => setGuide({ enabled })} />
        {g.enabled && (
          <>
            <Field label="Intro text"><Textarea rows={2} value={g.intro} onChange={(e) => setGuide({ intro: e.target.value })} /></Field>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    {g.columns.map((c, ci) => (
                      <th key={ci} className="p-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            value={c}
                            onChange={(e) => setGuide({ columns: g.columns.map((x, j) => (j === ci ? e.target.value : x)) })}
                            className="h-9 w-full min-w-[70px] rounded border border-zinc-200 bg-white px-2 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                            aria-label={`Column ${ci + 1} title`}
                          />
                          {g.columns.length > 1 && (
                            <IconBtn label="Remove column" danger onClick={() => setGuide({ columns: g.columns.filter((_, j) => j !== ci), rows: g.rows.map((r) => r.filter((_, j) => j !== ci)) })}>
                              <Trash2 size={13} />
                            </IconBtn>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="w-10 p-1.5">
                      {g.columns.length < 6 && (
                        <IconBtn label="Add column" onClick={() => setGuide({ columns: [...g.columns, "New"], rows: g.rows.map((r) => [...r, ""]) })}>
                          <Plus size={15} />
                        </IconBtn>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((row, ri) => (
                    <tr key={ri} className="border-t border-zinc-100 dark:border-zinc-800">
                      {g.columns.map((_, ci) => (
                        <td key={ci} className="p-1.5">
                          <input
                            value={row[ci] ?? ""}
                            onChange={(e) => setGuide({ rows: g.rows.map((r, j) => (j === ri ? g.columns.map((__, k) => (k === ci ? e.target.value : r[k] ?? "")) : r)) })}
                            className="h-9 w-full min-w-[70px] rounded border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                            aria-label={`Row ${ri + 1}, ${g.columns[ci]}`}
                          />
                        </td>
                      ))}
                      <td className="p-1.5">
                        <IconBtn label="Remove row" danger onClick={() => setGuide({ rows: g.rows.filter((_, j) => j !== ri) })}>
                          <Trash2 size={13} />
                        </IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {g.rows.length < 24 && (
                <button type="button" onClick={() => setGuide({ rows: [...g.rows, g.columns.map(() => "")] })} className="flex w-full items-center justify-center gap-1.5 border-t border-zinc-200 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <Plus size={14} /> Add row
                </button>
              )}
            </div>
            <Field label="Note under the table"><Input value={g.note} onChange={(e) => setGuide({ note: e.target.value })} /></Field>
          </>
        )}
      </EditorSection>

      <EditorSection title="Below the product" icon={<LayoutPanelTop size={18} />}>
        <Toggle label="Customer reviews" checked={v.showReviews} onChange={(x) => set("showReviews", x)} />
        <Toggle label="Related products carousel" checked={v.showCompleteTheLook} onChange={(x) => set("showCompleteTheLook", x)} />
        {v.showCompleteTheLook && (
          <Field label="Carousel title"><Input value={v.completeTheLookTitle} onChange={(e) => set("completeTheLookTitle", e.target.value)} /></Field>
        )}
        <Toggle label="“Recently viewed” products" checked={v.showRecentlyViewed} onChange={(x) => set("showRecentlyViewed", x)} />
      </EditorSection>
    </EditorShell>
  );
}
