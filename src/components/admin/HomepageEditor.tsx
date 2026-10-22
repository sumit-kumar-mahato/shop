"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Select, Textarea } from "@/components/ui/Form";
import { Panel } from "@/components/admin/ui";
import { SingleImageField } from "@/components/admin/ImageUploader";
import SettingsSaveBar from "@/components/admin/SettingsSaveBar";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { HOMEPAGE_SECTIONS, SERVICE_ICONS, type Banner, type HomepageSettings } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

const toLocalInput = (iso: string) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default function HomepageEditor({ initial }: { initial: HomepageSettings }) {
  const { value: v, setValue: setV, dirty, saving, error, save, reset } = useSettingsForm("homepage", initial);

  const moveSection = (i: number, dir: -1 | 1) => {
    const sections = [...v.sections];
    [sections[i], sections[i + dir]] = [sections[i + dir], sections[i]];
    setV({ ...v, sections });
  };
  const setBanner = (i: number, patch: Partial<Banner>) => setV({ ...v, banners: v.banners.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  const moveBanner = (i: number, dir: -1 | 1) => {
    const banners = [...v.banners];
    [banners[i], banners[i + dir]] = [banners[i + dir], banners[i]];
    setV({ ...v, banners });
  };

  return (
    <div className="space-y-6">
      <FormError message={error} />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="Sections" description="Show, hide and reorder homepage sections" className="h-fit xl:sticky xl:top-20">
          <ul className="space-y-1.5">
            {v.sections.map((s, i) => (
              <li key={s.id} className={cn("flex items-center gap-2 rounded-md border px-3 py-2 text-sm", s.enabled ? "border-zinc-200 dark:border-zinc-700" : "border-dashed border-zinc-200 text-zinc-400 dark:border-zinc-800")}>
                <span className="flex-1">{HOMEPAGE_SECTIONS[s.id]}</span>
                <button
                  onClick={() => setV({ ...v, sections: v.sections.map((x, j) => (j === i ? { ...x, enabled: !x.enabled } : x)) })}
                  className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label={s.enabled ? `Hide ${HOMEPAGE_SECTIONS[s.id]}` : `Show ${HOMEPAGE_SECTIONS[s.id]}`}
                  title={s.enabled ? "Visible — click to hide" : "Hidden — click to show"}
                >
                  {s.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="Move up"><ArrowUp size={15} /></button>
                <button onClick={() => moveSection(i, 1)} disabled={i === v.sections.length - 1} className="rounded p-1 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="Move down"><ArrowDown size={15} /></button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">Product sections (New arrivals, Best sellers…) show products you tick under “Homepage placement” when editing a product.</p>
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Hero banners"
            description="Large slides at the top of the homepage"
            actions={
              <Button
                size="sm"
                variant="outline"
                disabled={v.banners.length >= 8}
                onClick={() =>
                  setV({
                    ...v,
                    banners: [...v.banners, { id: `banner-${Date.now()}`, eyebrow: "", title: "New banner", description: "", buttonText: "Shop now", link: "/shop", image: "", align: "left" }],
                  })
                }
              >
                <Plus size={14} /> Add banner
              </Button>
            }
          >
            <div className="space-y-6">
              {v.banners.length === 0 && <p className="text-sm text-zinc-500">No banners — the hero section will be hidden.</p>}
              {v.banners.map((b, i) => (
                <div key={b.id} className="rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Slide {i + 1}</p>
                    <div className="flex gap-1">
                      <button onClick={() => moveBanner(i, -1)} disabled={i === 0} className="rounded p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="Move up"><ArrowUp size={15} /></button>
                      <button onClick={() => moveBanner(i, 1)} disabled={i === v.banners.length - 1} className="rounded p-1.5 hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800" aria-label="Move down"><ArrowDown size={15} /></button>
                      <button onClick={() => setV({ ...v, banners: v.banners.filter((_, j) => j !== i) })} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label="Delete slide"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                    <SingleImageField value={b.image} onChange={(image) => setBanner(i, { image })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Small heading"><Input value={b.eyebrow} onChange={(e) => setBanner(i, { eyebrow: e.target.value })} /></Field>
                      <Field label="Text position">
                        <Select value={b.align} onChange={(e) => setBanner(i, { align: e.target.value as Banner["align"] })}>
                          <option value="left">Left</option>
                          <option value="center">Centre</option>
                        </Select>
                      </Field>
                      <Field label="Headline" className="sm:col-span-2"><Input value={b.title} onChange={(e) => setBanner(i, { title: e.target.value })} /></Field>
                      <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={b.description} onChange={(e) => setBanner(i, { description: e.target.value })} /></Field>
                      <Field label="Button text"><Input value={b.buttonText} onChange={(e) => setBanner(i, { buttonText: e.target.value })} /></Field>
                      <Field label="Button link" hint="e.g. /shop?category=sarees"><Input value={b.link} onChange={(e) => setBanner(i, { link: e.target.value })} /></Field>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Service highlights" description="Up to 4 short promises shown under the banner">
            <div className="grid gap-4 sm:grid-cols-2">
              {v.services.map((s, i) => (
                <div key={i} className="space-y-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="flex gap-2">
                    <Select value={s.icon} onChange={(e) => setV({ ...v, services: v.services.map((x, j) => (j === i ? { ...x, icon: e.target.value as typeof s.icon } : x)) })} className="h-9 w-32" aria-label="Icon">
                      {SERVICE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </Select>
                    <Input className="h-9" value={s.title} onChange={(e) => setV({ ...v, services: v.services.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} aria-label="Title" />
                    <button onClick={() => setV({ ...v, services: v.services.filter((_, j) => j !== i) })} className="rounded p-2 text-red-600" aria-label="Remove"><Trash2 size={15} /></button>
                  </div>
                  <Input className="h-9" value={s.description} onChange={(e) => setV({ ...v, services: v.services.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} aria-label="Description" />
                </div>
              ))}
            </div>
            {v.services.length < 4 && (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setV({ ...v, services: [...v.services, { icon: "star", title: "", description: "" }] })}>
                <Plus size={14} /> Add highlight
              </Button>
            )}
          </Panel>

          <Panel title="Promotional banner">
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <SingleImageField value={v.promo.image} onChange={(image) => setV({ ...v, promo: { ...v.promo, image } })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Small heading"><Input value={v.promo.eyebrow} onChange={(e) => setV({ ...v, promo: { ...v.promo, eyebrow: e.target.value } })} /></Field>
                <Field label="Headline"><Input value={v.promo.title} onChange={(e) => setV({ ...v, promo: { ...v.promo, title: e.target.value } })} /></Field>
                <Field label="Text" className="sm:col-span-2"><Textarea rows={2} value={v.promo.subtitle} onChange={(e) => setV({ ...v, promo: { ...v.promo, subtitle: e.target.value } })} /></Field>
                <Field label="Button text"><Input value={v.promo.buttonText} onChange={(e) => setV({ ...v, promo: { ...v.promo, buttonText: e.target.value } })} /></Field>
                <Field label="Button link"><Input value={v.promo.link} onChange={(e) => setV({ ...v, promo: { ...v.promo, link: e.target.value } })} /></Field>
              </div>
            </div>
          </Panel>

          <Panel title="Flash sale" description="Shows products marked “Flash sale”. Hidden automatically when the end time passes.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Badge"><Input value={v.flashSale.badge} onChange={(e) => setV({ ...v, flashSale: { ...v.flashSale, badge: e.target.value } })} /></Field>
              <Field label="Ends at" hint="Leave empty for no countdown">
                <Input type="datetime-local" value={toLocalInput(v.flashSale.endsAt)} onChange={(e) => setV({ ...v, flashSale: { ...v.flashSale, endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" } })} />
              </Field>
              <Field label="Title" className="sm:col-span-2"><Input value={v.flashSale.title} onChange={(e) => setV({ ...v, flashSale: { ...v.flashSale, title: e.target.value } })} /></Field>
              <Field label="Text" className="sm:col-span-2"><Textarea rows={2} value={v.flashSale.subtitle} onChange={(e) => setV({ ...v, flashSale: { ...v.flashSale, subtitle: e.target.value } })} /></Field>
            </div>
          </Panel>

          <Panel title="Brand story">
            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
              <SingleImageField value={v.brandStory.image} onChange={(image) => setV({ ...v, brandStory: { ...v.brandStory, image } })} aspect="aspect-[4/5]" />
              <div className="space-y-3">
                <Field label="Small heading"><Input value={v.brandStory.eyebrow} onChange={(e) => setV({ ...v, brandStory: { ...v.brandStory, eyebrow: e.target.value } })} /></Field>
                <Field label="Title"><Input value={v.brandStory.title} onChange={(e) => setV({ ...v, brandStory: { ...v.brandStory, title: e.target.value } })} /></Field>
                <Field label="Story" hint="Blank line between paragraphs"><Textarea rows={6} value={v.brandStory.body} onChange={(e) => setV({ ...v, brandStory: { ...v.brandStory, body: e.target.value } })} /></Field>
              </div>
            </div>
          </Panel>

          <Panel title="Newsletter sign-up">
            <div className="space-y-3">
              <Field label="Title"><Input value={v.newsletter.title} onChange={(e) => setV({ ...v, newsletter: { ...v.newsletter, title: e.target.value } })} /></Field>
              <Field label="Text"><Textarea rows={2} value={v.newsletter.description} onChange={(e) => setV({ ...v, newsletter: { ...v.newsletter, description: e.target.value } })} /></Field>
            </div>
          </Panel>
        </div>
      </div>
      <SettingsSaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
