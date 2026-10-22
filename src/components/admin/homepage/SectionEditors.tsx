"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { SingleImageField } from "@/components/admin/ImageUploader";
import { IconPicker, LinkInput, ListEditor, Segmented, Slider, Toggle } from "@/components/admin/fields";
import type { Banner, HomepageSectionId, HomepageSettings } from "@/lib/settings-schema";
import { ButtonFields, HeadingFields, type EditorContext } from "./BlockEditors";

type Ctx = EditorContext & { value: HomepageSettings; set: (v: HomepageSettings) => void };

const toLocalInput = (iso: string) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : "");

function Note({ children, href, linkText }: { children: React.ReactNode; href?: string; linkText?: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
      {children}
      {href && (
        <Link href={href} className="inline-flex items-center gap-0.5 font-semibold text-zinc-900 hover:underline dark:text-white">
          {linkText} <ArrowUpRight size={12} />
        </Link>
      )}
    </p>
  );
}

const PRODUCT_SECTION_NOTES: Partial<Record<HomepageSectionId, { flag: string; label: string }>> = {
  "new-arrivals": { flag: "isNewArrival", label: "New arrival" },
  "best-sellers": { flag: "isBestSeller", label: "Best seller" },
  featured: { flag: "isFeatured", label: "Featured" },
  trending: { flag: "isTrending", label: "Trending" },
};

function HeroEditor({ value: v, set, suggestions }: Ctx) {
  const setBanner = (i: number, patch: Partial<Banner>) => set({ ...v, banners: v.banners.map((b, j) => (j === i ? { ...b, ...patch } : b)) });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Height (when it's the first section)">
          <Segmented value={v.hero.height} onChange={(height) => set({ ...v, hero: { ...v.hero, height } })} options={[{ value: "full", label: "Full screen" }, { value: "large", label: "Large" }, { value: "medium", label: "Medium" }]} />
        </Field>
        <Field label="Time per slide"><Slider value={v.hero.autoplaySeconds} min={3} max={20} onChange={(autoplaySeconds) => set({ ...v, hero: { ...v.hero, autoplaySeconds } })} suffix="s" /></Field>
      </div>
      <Toggle label="Slow zoom on photos (Ken Burns effect)" checked={v.hero.kenBurns} onChange={(kenBurns) => set({ ...v, hero: { ...v.hero, kenBurns } })} />
      <Field label="Slides">
        <ListEditor
          items={v.banners}
          onChange={(banners) => set({ ...v, banners })}
          max={8}
          addLabel="Add slide"
          itemLabel={(b, i) => `${i + 1}. ${b.title || "Untitled slide"}`}
          create={(): Banner => ({ id: `banner-${Date.now()}`, eyebrow: "", title: "New slide", description: "", buttonText: "Shop now", link: "/shop", secondaryText: "", secondaryLink: "", image: "", mobileImage: "", align: "left", overlay: 55, startsAt: "", endsAt: "" })}
          render={(b, update, i) => (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
                <Field label="Photo" hint="Wide photo, at least 1800 px"><SingleImageField value={b.image} onChange={(image) => update({ image })} /></Field>
                <Field label="Phone photo" hint="Optional portrait crop"><SingleImageField value={b.mobileImage} onChange={(mobileImage) => update({ mobileImage })} aspect="aspect-[3/4]" /></Field>
              </div>
              <HeadingFields eyebrow={b.eyebrow} title={b.title} onChange={update} />
              <Field label="Description"><Textarea rows={2} value={b.description} onChange={(e) => update({ description: e.target.value })} /></Field>
              <ButtonFields text={b.buttonText} link={b.link} onChange={update} suggestions={suggestions} label="Main button" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Second button text" hint="Optional"><Input value={b.secondaryText} onChange={(e) => update({ secondaryText: e.target.value })} /></Field>
                <Field label="Second button link"><LinkInput value={b.secondaryLink} onChange={(secondaryLink) => update({ secondaryLink })} suggestions={suggestions} /></Field>
                <Field label="Text position">
                  <Segmented value={b.align} onChange={(align) => update({ align })} options={[{ value: "left", label: "Left" }, { value: "center", label: "Centre" }]} />
                </Field>
                <Field label="Darken photo"><Slider value={b.overlay} min={0} max={90} onChange={(overlay) => update({ overlay })} suffix="%" /></Field>
                <Field label="Show from" hint="Optional — schedule festive slides">
                  <Input type="datetime-local" value={toLocalInput(b.startsAt)} onChange={(e) => update({ startsAt: fromLocalInput(e.target.value) })} />
                </Field>
                <Field label="Hide after" hint="Optional">
                  <Input type="datetime-local" value={toLocalInput(b.endsAt)} onChange={(e) => update({ endsAt: fromLocalInput(e.target.value) })} />
                </Field>
              </div>
              {!b.image && <p className="text-xs text-red-600">Slide {i + 1} needs a photo before you can publish.</p>}
            </div>
          )}
        />
      </Field>
    </>
  );
}

function ServicesEditor({ value: v, set }: Ctx) {
  return (
    <ListEditor
      items={v.services}
      onChange={(services) => set({ ...v, services })}
      max={6}
      addLabel="Add highlight"
      compact
      create={(): HomepageSettings["services"][number] => ({ icon: "star", title: "", description: "" })}
      render={(s, update) => (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <IconPicker value={s.icon} onChange={(icon) => update({ icon })} />
          <Input className="h-10 sm:w-40" value={s.title} onChange={(e) => update({ title: e.target.value })} placeholder="Title" aria-label="Title" />
          <Input className="h-10" value={s.description} onChange={(e) => update({ description: e.target.value })} placeholder="Description" aria-label="Description" />
        </div>
      )}
    />
  );
}

/** Fields for one built-in homepage section. */
export function SectionEditor({ id, ctx }: { id: HomepageSectionId; ctx: Ctx }) {
  const { value: v, set, suggestions } = ctx;
  switch (id) {
    case "hero":
      return <HeroEditor {...ctx} />;
    case "services":
      return (
        <>
          <ServicesEditor {...ctx} />
          <Note>These scroll in a strip under the banner.</Note>
        </>
      );
    case "categories":
    case "new-arrivals":
    case "best-sellers":
    case "featured":
    case "trending":
    case "testimonials": {
      const note = PRODUCT_SECTION_NOTES[id];
      return (
        <>
          <HeadingFields eyebrow={v.sectionText[id].eyebrow} title={v.sectionText[id].title} onChange={(p) => set({ ...v, sectionText: { ...v.sectionText, [id]: { ...v.sectionText[id], ...p } } })} />
          {note && (
            <Note href={`/admin/products?flag=${note.flag}`} linkText={`See “${note.label}” products`}>
              Shows active products marked “{note.label}”. Tick it when editing a product, or select several products and use bulk actions.
            </Note>
          )}
          {id === "categories" && <Note href="/admin/categories" linkText="Manage categories">Shows your active categories (first 5 as large photos) in their sort order.</Note>}
          {id === "testimonials" && <Note href="/admin/reviews" linkText="Moderate reviews">Shows the latest approved 4★ and 5★ reviews.</Note>}
        </>
      );
    }
    case "promo":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
            <Field label="Background photo"><SingleImageField value={v.promo.image} onChange={(image) => set({ ...v, promo: { ...v.promo, image } })} /></Field>
            <div className="space-y-4">
              <HeadingFields eyebrow={v.promo.eyebrow} title={v.promo.title} onChange={(p) => set({ ...v, promo: { ...v.promo, ...p } })} />
              <Field label="Text"><Textarea rows={2} value={v.promo.subtitle} onChange={(e) => set({ ...v, promo: { ...v.promo, subtitle: e.target.value } })} /></Field>
            </div>
          </div>
          <ButtonFields text={v.promo.buttonText} link={v.promo.link} onChange={(p) => set({ ...v, promo: { ...v.promo, ...p } })} suggestions={suggestions} />
        </>
      );
    case "flash-sale":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge"><Input value={v.flashSale.badge} onChange={(e) => set({ ...v, flashSale: { ...v.flashSale, badge: e.target.value } })} /></Field>
            <Field label="Ends at" hint="Leave empty for no countdown. The section hides itself when the time passes.">
              <Input type="datetime-local" value={toLocalInput(v.flashSale.endsAt)} onChange={(e) => set({ ...v, flashSale: { ...v.flashSale, endsAt: fromLocalInput(e.target.value) } })} />
            </Field>
          </div>
          <Field label="Title"><Input value={v.flashSale.title} onChange={(e) => set({ ...v, flashSale: { ...v.flashSale, title: e.target.value } })} /></Field>
          <Field label="Text"><Textarea rows={2} value={v.flashSale.subtitle} onChange={(e) => set({ ...v, flashSale: { ...v.flashSale, subtitle: e.target.value } })} /></Field>
          <ButtonFields text={v.flashSale.buttonText} link={v.flashSale.link} onChange={(p) => set({ ...v, flashSale: { ...v.flashSale, ...p } })} suggestions={suggestions} />
          <Note href="/admin/products?flag=isFlashSale" linkText="See “Flash sale” products">Shows up to 4 products marked “Flash sale”.</Note>
        </>
      );
    case "brand-story":
      return (
        <>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label="Photo"><SingleImageField value={v.brandStory.image} onChange={(image) => set({ ...v, brandStory: { ...v.brandStory, image } })} aspect="aspect-[4/5]" /></Field>
            <div className="space-y-4">
              <HeadingFields eyebrow={v.brandStory.eyebrow} title={v.brandStory.title} onChange={(p) => set({ ...v, brandStory: { ...v.brandStory, ...p } })} />
              <Field label="Story" hint="Blank line between paragraphs"><Textarea rows={6} value={v.brandStory.body} onChange={(e) => set({ ...v, brandStory: { ...v.brandStory, body: e.target.value } })} /></Field>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Badge on photo — big text"><Input value={v.brandStory.badgeTitle} onChange={(e) => set({ ...v, brandStory: { ...v.brandStory, badgeTitle: e.target.value } })} /></Field>
            <Field label="Badge on photo — small text"><Input value={v.brandStory.badgeText} onChange={(e) => set({ ...v, brandStory: { ...v.brandStory, badgeText: e.target.value } })} /></Field>
          </div>
          <ButtonFields text={v.brandStory.buttonText} link={v.brandStory.link} onChange={(p) => set({ ...v, brandStory: { ...v.brandStory, ...p } })} suggestions={suggestions} label="Link" />
        </>
      );
    case "newsletter":
      return (
        <>
          <HeadingFields eyebrow={v.newsletter.eyebrow} title={v.newsletter.title} onChange={(p) => set({ ...v, newsletter: { ...v.newsletter, ...p } })} />
          <Field label="Text"><Textarea rows={2} value={v.newsletter.description} onChange={(e) => set({ ...v, newsletter: { ...v.newsletter, description: e.target.value } })} /></Field>
          <Note href="/admin/messages?tab=subscribers" linkText="View subscribers">Subscribers are saved to your database.</Note>
        </>
      );
  }
}
