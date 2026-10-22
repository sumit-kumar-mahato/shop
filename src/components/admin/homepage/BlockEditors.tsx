"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { SingleImageField } from "@/components/admin/ImageUploader";
import { LinkInput, ListEditor, Segmented, Slider, Toggle, type LinkSuggestion } from "@/components/admin/fields";
import { PRODUCT_SOURCES, type BlockOf, type HomepageBlock } from "@/lib/settings-schema";
import { youtubeId } from "@/lib/homepage";
import { cn } from "@/lib/utils";

export type EditorContext = {
  suggestions: LinkSuggestion[];
  categories: Array<{ name: string; slug: string; image: string | null }>;
};

type Props<T extends HomepageBlock["type"]> = { block: BlockOf<T>; update: (patch: Partial<BlockOf<T>>) => void; ctx: EditorContext };

export function HeadingFields({ eyebrow, title, onChange }: { eyebrow: string; title: string; onChange: (p: { eyebrow?: string; title?: string }) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
      <Field label="Small heading"><Input value={eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} /></Field>
      <Field label="Title"><Input value={title} onChange={(e) => onChange({ title: e.target.value })} /></Field>
    </div>
  );
}

export function ButtonFields({ text, link, onChange, suggestions, label = "Button" }: { text: string; link: string; onChange: (p: { buttonText?: string; link?: string }) => void; suggestions: LinkSuggestion[]; label?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`${label} text`} hint="Leave empty to hide the button"><Input value={text} onChange={(e) => onChange({ buttonText: e.target.value })} /></Field>
      <Field label={`${label} link`}><LinkInput value={link} onChange={(l) => onChange({ link: l })} suggestions={suggestions} /></Field>
    </div>
  );
}

function ProductsEditor({ block, update, ctx }: Props<"products">) {
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Which products">
          <Select value={block.source} onChange={(e) => update({ source: e.target.value as BlockOf<"products">["source"] })}>
            {Object.entries(PRODUCT_SOURCES).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </Select>
        </Field>
        {block.source === "category" && (
          <Field label="Category">
            <Select value={block.category} onChange={(e) => update({ category: e.target.value })}>
              <option value="">Choose a category…</option>
              {ctx.categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </Select>
          </Field>
        )}
        {block.source === "gender" && (
          <Field label="Audience">
            <Select value={block.gender} onChange={(e) => update({ gender: e.target.value as BlockOf<"products">["gender"] })}>
              <option value="WOMEN">Women</option>
              <option value="MEN">Men</option>
              <option value="KIDS">Kids</option>
              <option value="UNISEX">Unisex</option>
            </Select>
          </Field>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Layout">
          <Segmented value={block.layout} onChange={(layout) => update({ layout })} options={[{ value: "rail", label: "Carousel" }, { value: "grid", label: "Grid" }]} />
        </Field>
        <Field label="Number of products"><Slider value={block.limit} min={2} max={24} onChange={(limit) => update({ limit })} /></Field>
      </div>
      <ButtonFields text={block.buttonText} link={block.link} onChange={update} suggestions={ctx.suggestions} label="“View all”" />
      {["new", "best", "featured", "trending", "flash"].includes(block.source) && (
        <p className="text-xs text-zinc-500">Shows products you have ticked under “Homepage placement” when editing a product (or with bulk actions on the Products page).</p>
      )}
    </>
  );
}

function BannerEditor({ block, update, ctx }: Props<"banner">) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
        <Field label="Photo" hint="Wide landscape photo, at least 1600 px wide"><SingleImageField value={block.image} onChange={(image) => update({ image })} /></Field>
        <Field label="Phone photo" hint="Optional portrait crop for phones"><SingleImageField value={block.mobileImage} onChange={(mobileImage) => update({ mobileImage })} aspect="aspect-[3/4]" /></Field>
      </div>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <Field label="Text"><Textarea rows={2} value={block.subtitle} onChange={(e) => update({ subtitle: e.target.value })} /></Field>
      <ButtonFields text={block.buttonText} link={block.link} onChange={update} suggestions={ctx.suggestions} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Text position">
          <Segmented value={block.align} onChange={(align) => update({ align })} options={[{ value: "left", label: "Left" }, { value: "center", label: "Centre" }, { value: "right", label: "Right" }]} />
        </Field>
        <Field label="Height">
          <Segmented value={block.height} onChange={(height) => update({ height })} options={[{ value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "full", label: "Full screen" }]} />
        </Field>
        <Field label="Darken photo" hint="Makes white text easier to read"><Slider value={block.overlay} min={0} max={90} onChange={(overlay) => update({ overlay })} suffix="%" /></Field>
        <div className="pt-6"><Toggle label="Parallax (photo moves slower than the page)" checked={block.parallax} onChange={(parallax) => update({ parallax })} /></div>
      </div>
    </>
  );
}

function ImageTextEditor({ block, update, ctx }: Props<"image-text">) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <Field label="Photo"><SingleImageField value={block.image} onChange={(image) => update({ image })} aspect="aspect-[4/5]" /></Field>
        <div className="space-y-4">
          <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
          <Field label="Text" hint="Blank line between paragraphs. Start a line with ## for a sub-heading."><Textarea rows={6} value={block.body} onChange={(e) => update({ body: e.target.value })} /></Field>
        </div>
      </div>
      <ButtonFields text={block.buttonText} link={block.link} onChange={update} suggestions={ctx.suggestions} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Photo side"><Segmented value={block.imageSide} onChange={(imageSide) => update({ imageSide })} options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]} /></Field>
        <Field label="Background"><Segmented value={block.background} onChange={(background) => update({ background })} options={[{ value: "plain", label: "Plain" }, { value: "tinted", label: "Tinted" }, { value: "dark", label: "Dark" }]} /></Field>
      </div>
    </>
  );
}

function CategoriesEditor({ block, update, ctx }: Props<"categories">) {
  const toggle = (slug: string) => update({ slugs: block.slugs.includes(slug) ? block.slugs.filter((s) => s !== slug) : [...block.slugs, slug].slice(0, 12) });
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <Field label="Style">
        <Segmented value={block.style} onChange={(style) => update({ style })} options={[{ value: "circles", label: "Circles" }, { value: "tiles", label: "Photo tiles" }]} />
      </Field>
      <Field label="Categories" hint={block.slugs.length ? "Shown in the order you pick them." : "None picked — your first 8 categories are shown."}>
        <div className="flex flex-wrap gap-2">
          {ctx.categories.map((c) => {
            const pos = block.slugs.indexOf(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                className={cn(
                  "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors",
                  pos >= 0 ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700",
                )}
                aria-pressed={pos >= 0}
              >
                <span className="relative h-7 w-7 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                  {pos >= 0 && <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[11px] font-bold text-white">{pos + 1}</span>}
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}

function GalleryEditor({ block, update, ctx }: Props<"gallery">) {
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <Field label="Text"><Input value={block.subtitle} onChange={(e) => update({ subtitle: e.target.value })} /></Field>
      <Field label="Layout">
        <Segmented value={block.layout} onChange={(layout) => update({ layout })} options={[{ value: "grid", label: "Mosaic grid" }, { value: "strip", label: "Scrolling strip" }]} />
      </Field>
      <Field label="Photos">
        <ListEditor
          items={block.items}
          onChange={(items) => update({ items })}
          create={() => ({ image: "", link: "", caption: "" })}
          max={16}
          addLabel="Add photo"
          itemLabel={(it, i) => it.caption || `Photo ${i + 1}`}
          render={(it, u) => (
            <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
              <SingleImageField value={it.image} onChange={(image) => u({ image })} aspect="aspect-square" />
              <div className="space-y-3">
                <Field label="Caption (on hover)"><Input value={it.caption} onChange={(e) => u({ caption: e.target.value })} /></Field>
                <Field label="Link (optional)"><LinkInput value={it.link} onChange={(link) => u({ link })} suggestions={ctx.suggestions} placeholder="/product/…" /></Field>
              </div>
            </div>
          )}
        />
      </Field>
      <ButtonFields text={block.buttonText} link={block.link} onChange={update} suggestions={ctx.suggestions} />
    </>
  );
}

function MarqueeEditor({ block, update }: Props<"marquee">) {
  return (
    <>
      <Field label="Phrases" hint="Short words or phrases that scroll across the screen">
        <ListEditor
          items={block.items.map((text) => ({ text }))}
          onChange={(items) => update({ items: items.map((i) => i.text) })}
          create={() => ({ text: "New phrase" })}
          max={10}
          compact
          addLabel="Add phrase"
          render={(it, u) => <Input className="h-10" value={it.text} onChange={(e) => u({ text: e.target.value })} aria-label="Phrase" />}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Style">
          <Segmented value={block.style} onChange={(style) => update({ style })} options={[{ value: "outline", label: "Outline" }, { value: "solid", label: "Solid" }, { value: "brand", label: "Brand colour" }]} />
        </Field>
        <Field label="Speed">
          <Segmented value={block.speed} onChange={(speed) => update({ speed })} options={[{ value: "slow", label: "Slow" }, { value: "normal", label: "Normal" }, { value: "fast", label: "Fast" }]} />
        </Field>
      </div>
    </>
  );
}

function VideoEditor({ block, update }: Props<"video">) {
  const invalid = block.youtubeUrl !== "" && !youtubeId(block.youtubeUrl);
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <Field label="Text"><Input value={block.subtitle} onChange={(e) => update({ subtitle: e.target.value })} /></Field>
      <Field label="YouTube link" hint={invalid ? <span className="text-red-600">That doesn’t look like a YouTube video link.</span> : "e.g. https://www.youtube.com/watch?v=… — the video loads only when a visitor presses play."}>
        <Input value={block.youtubeUrl} onChange={(e) => update({ youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=" />
      </Field>
      <Field label="Cover image" hint="Optional — YouTube's thumbnail is used otherwise" className="max-w-sm"><SingleImageField value={block.cover} onChange={(cover) => update({ cover })} /></Field>
    </>
  );
}

function TextEditor({ block, update, ctx }: Props<"text">) {
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <Field label="Text" hint="Blank line between paragraphs. Start a line with ## for a sub-heading."><Textarea rows={6} value={block.body} onChange={(e) => update({ body: e.target.value })} /></Field>
      <ButtonFields text={block.buttonText} link={block.link} onChange={update} suggestions={ctx.suggestions} />
      <Field label="Alignment"><Segmented value={block.align} onChange={(align) => update({ align })} options={[{ value: "center", label: "Centre" }, { value: "left", label: "Left" }]} /></Field>
    </>
  );
}

function FaqEditor({ block, update }: Props<"faq">) {
  return (
    <>
      <HeadingFields eyebrow={block.eyebrow} title={block.title} onChange={update} />
      <ListEditor
        items={block.items}
        onChange={(items) => update({ items })}
        create={() => ({ question: "New question?", answer: "" })}
        max={24}
        addLabel="Add question"
        itemLabel={(q) => q.question || "Question"}
        render={(q, u) => (
          <div className="space-y-3">
            <Field label="Question"><Input value={q.question} onChange={(e) => u({ question: e.target.value })} /></Field>
            <Field label="Answer"><Textarea rows={3} value={q.answer} onChange={(e) => u({ answer: e.target.value })} /></Field>
          </div>
        )}
      />
    </>
  );
}

/** The fields for one custom homepage block. */
export function BlockEditor({ block, onChange, ctx }: { block: HomepageBlock; onChange: (b: HomepageBlock) => void; ctx: EditorContext }) {
  const update = (patch: Partial<HomepageBlock>) => onChange({ ...block, ...patch } as HomepageBlock);
  switch (block.type) {
    case "products":
      return <ProductsEditor block={block} update={update} ctx={ctx} />;
    case "banner":
      return <BannerEditor block={block} update={update} ctx={ctx} />;
    case "image-text":
      return <ImageTextEditor block={block} update={update} ctx={ctx} />;
    case "categories":
      return <CategoriesEditor block={block} update={update} ctx={ctx} />;
    case "gallery":
      return <GalleryEditor block={block} update={update} ctx={ctx} />;
    case "marquee":
      return <MarqueeEditor block={block} update={update} ctx={ctx} />;
    case "video":
      return <VideoEditor block={block} update={update} ctx={ctx} />;
    case "text":
      return <TextEditor block={block} update={update} ctx={ctx} />;
    case "faq":
      return <FaqEditor block={block} update={update} ctx={ctx} />;
  }
}

/** A short human label for a block in the sections list. */
export function blockSummary(block: HomepageBlock): string {
  switch (block.type) {
    case "marquee":
      return block.items.join(" · ");
    case "products":
      return block.title || PRODUCT_SOURCES[block.source];
    default:
      return ("title" in block && block.title) || "";
  }
}
