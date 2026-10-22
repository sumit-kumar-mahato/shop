"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlignLeft,
  BadgeCheck,
  BookOpen,
  Copy,
  Eye,
  EyeOff,
  Film,
  GalleryHorizontalEnd,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  Megaphone,
  MessageSquareQuote,
  MoveHorizontal,
  PanelsTopLeft,
  Plus,
  ShoppingBag,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import EditorShell, { type PreviewPath } from "@/components/admin/EditorShell";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { IconBtn } from "@/components/admin/fields";
import { BlockEditor, blockSummary, type EditorContext } from "@/components/admin/homepage/BlockEditors";
import { SectionEditor } from "@/components/admin/homepage/SectionEditors";
import {
  BLOCK_TYPES,
  HOMEPAGE_SECTIONS,
  isBuiltInSection,
  newBlock,
  type BlockType,
  type HomepageBlock,
  type HomepageSectionId,
  type HomepageSettings,
} from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<HomepageSectionId, LucideIcon> = {
  hero: PanelsTopLeft,
  services: BadgeCheck,
  categories: LayoutGrid,
  "new-arrivals": Sparkles,
  promo: Megaphone,
  "best-sellers": TrendingUp,
  "flash-sale": Timer,
  featured: ShoppingBag,
  trending: TrendingUp,
  "brand-story": BookOpen,
  testimonials: MessageSquareQuote,
  newsletter: Mail,
};
const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  products: ShoppingBag,
  banner: ImageIcon,
  "image-text": BookOpen,
  categories: LayoutGrid,
  gallery: GalleryHorizontalEnd,
  marquee: MoveHorizontal,
  video: Film,
  text: AlignLeft,
  faq: HelpCircle,
};

export default function HomepageEditor({ initial, ctx, previewPaths }: { initial: HomepageSettings; ctx: EditorContext; previewPaths: PreviewPath[] }) {
  const form = useSettingsForm("homepage", initial);
  const v = form.value;
  const set = form.setValue;
  const [selected, setSelected] = useState<string>(v.sections[0]?.id ?? "hero");
  const [adding, setAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const blocks = new Map(v.blocks.map((b) => [b.id, b]));
  const sections = v.sections.filter((s) => isBuiltInSection(s.id) || blocks.has(s.id));
  const missingBuiltIns = (Object.keys(HOMEPAGE_SECTIONS) as HomepageSectionId[]).filter((id) => !v.sections.some((s) => s.id === id));
  const current = sections.find((s) => s.id === selected) ?? sections[0];

  useEffect(() => {
    if (!adding) return;
    const close = () => setAdding(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [adding]);

  const select = (id: string) => {
    setSelected(id);
    // On narrow screens the editor sits below the list — bring it into view.
    if (window.innerWidth < 1024) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const label = (id: string) => {
    if (isBuiltInSection(id)) return { name: HOMEPAGE_SECTIONS[id], detail: "", Icon: SECTION_ICONS[id] };
    const b = blocks.get(id)!;
    return { name: BLOCK_TYPES[b.type].label, detail: blockSummary(b), Icon: BLOCK_ICONS[b.type] };
  };

  const toggle = (id: string) => set({ ...v, sections: v.sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)) });

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const list = [...sections];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    set({ ...v, sections: list });
  };

  const addBlock = (type: BlockType) => {
    const block = newBlock(type);
    const at = Math.max(0, sections.findIndex((s) => s.id === current?.id)) + 1;
    const list = [...sections];
    list.splice(at, 0, { id: block.id, enabled: true });
    set({ ...v, blocks: [...v.blocks, block], sections: list });
    select(block.id);
  };

  const addBuiltIn = (id: HomepageSectionId) => {
    set({ ...v, sections: [...sections, { id, enabled: true }] });
    select(id);
  };

  const remove = (id: string) => {
    const i = sections.findIndex((s) => s.id === id);
    set({ ...v, sections: sections.filter((s) => s.id !== id), blocks: v.blocks.filter((b) => b.id !== id) });
    setSelected(sections[i + 1]?.id ?? sections[i - 1]?.id ?? "");
  };

  const duplicate = (id: string) => {
    const b = blocks.get(id);
    if (!b) return;
    const copy = { ...structuredClone(b), id: newBlock(b.type).id } as HomepageBlock;
    const i = sections.findIndex((s) => s.id === id);
    const list = [...sections];
    list.splice(i + 1, 0, { id: copy.id, enabled: true });
    set({ ...v, blocks: [...v.blocks, copy], sections: list });
    select(copy.id);
  };

  const updateBlock = (b: HomepageBlock) => set({ ...v, blocks: v.blocks.map((x) => (x.id === b.id ? b : x)) });

  const cur = current ? label(current.id) : null;
  const curBlock = current ? blocks.get(current.id) : undefined;

  return (
    <EditorShell {...form} onSave={() => void form.save()} onReset={form.reset} previewPaths={previewPaths}>
      <div className={cn("grid gap-5", form.preview.on ? "2xl:grid-cols-[260px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]")}>
        {/* Sections list */}
        <aside className={cn("h-fit rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900", form.preview.on ? "2xl:sticky 2xl:top-20" : "lg:sticky lg:top-20")}>
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div>
              <p className="font-semibold">Sections</p>
              <p className="text-xs text-zinc-500">Drag to reorder · {sections.filter((s) => s.enabled).length} visible</p>
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setAdding((a) => !a)}
                className="flex h-8 items-center gap-1 rounded-md bg-zinc-900 px-2.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
                aria-expanded={adding}
              >
                <Plus size={14} /> Add
              </button>
              {adding && (
                <div className="absolute right-0 top-full z-30 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Content blocks — add as many as you like</p>
                  {(Object.keys(BLOCK_TYPES) as BlockType[]).map((t) => {
                    const I = BLOCK_ICONS[t];
                    return (
                      <button key={t} type="button" onClick={() => { addBlock(t); setAdding(false); }} className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"><I size={16} /></span>
                        <span>
                          <span className="block text-sm font-medium">{BLOCK_TYPES[t].label}</span>
                          <span className="block text-xs text-zinc-500">{BLOCK_TYPES[t].description}</span>
                        </span>
                      </button>
                    );
                  })}
                  {missingBuiltIns.length > 0 && (
                    <>
                      <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Removed sections</p>
                      {missingBuiltIns.map((id) => {
                        const I = SECTION_ICONS[id];
                        return (
                          <button key={id} type="button" onClick={() => { addBuiltIn(id); setAdding(false); }} className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800"><I size={16} /></span>
                            {HOMEPAGE_SECTIONS[id]}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <ol className={cn("space-y-1 overflow-y-auto p-2", form.preview.on ? "max-h-72 2xl:max-h-[calc(100vh-14rem)]" : "max-h-[calc(100vh-14rem)]")}>
            {sections.map((s, i) => {
              const { name, detail, Icon } = label(s.id);
              const active = current?.id === s.id;
              return (
                <li
                  key={s.id}
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(i);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== i) {
                      reorder(dragIndex, i);
                      setDragIndex(i);
                    }
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-lg border px-1.5 py-1.5 text-sm transition-colors",
                    active ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-800" : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                    !s.enabled && "opacity-55",
                    dragIndex === i && "opacity-40",
                  )}
                >
                  <GripVertical size={15} className="flex-shrink-0 cursor-grab text-zinc-300 group-hover:text-zinc-500 dark:text-zinc-600" aria-hidden />
                  <button type="button" onClick={() => select(s.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <Icon size={15} className="flex-shrink-0 text-zinc-500" />
                    <span className="min-w-0">
                      <span className={cn("block truncate", active && "font-semibold")}>{name}</span>
                      {detail && <span className="block truncate text-[11px] text-zinc-500">{detail}</span>}
                    </span>
                  </button>
                  <div className="flex flex-shrink-0 opacity-70 group-hover:opacity-100">
                    <IconBtn label="Move up" onClick={() => reorder(i, i - 1)} disabled={i === 0}><span className="text-xs">↑</span></IconBtn>
                    <IconBtn label="Move down" onClick={() => reorder(i, i + 1)} disabled={i === sections.length - 1}><span className="text-xs">↓</span></IconBtn>
                    <IconBtn label={s.enabled ? `Hide ${name}` : `Show ${name}`} onClick={() => toggle(s.id)}>{s.enabled ? <Eye size={15} /> : <EyeOff size={15} />}</IconBtn>
                  </div>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* Selected section */}
        <div ref={detailRef} className="min-w-0 scroll-mt-20">
          {current && cur ? (
            <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><cur.Icon size={18} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{cur.name}</h2>
                  <p className="text-xs text-zinc-500">{curBlock ? BLOCK_TYPES[curBlock.type].description : "Built-in section"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(current.id)}
                  className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold", current.enabled ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400")}
                >
                  {current.enabled ? <Eye size={13} /> : <EyeOff size={13} />} {current.enabled ? "Visible" : "Hidden"}
                </button>
                {curBlock && <IconBtn label="Duplicate section" onClick={() => duplicate(current.id)}><Copy size={16} /></IconBtn>}
                <IconBtn label="Remove section" danger onClick={() => remove(current.id)}><Trash2 size={16} /></IconBtn>
              </div>
              <div className="space-y-5 p-5">
                {curBlock ? (
                  <BlockEditor block={curBlock} onChange={updateBlock} ctx={ctx} />
                ) : (
                  <SectionEditor id={current.id as HomepageSectionId} ctx={{ ...ctx, value: v, set }} />
                )}
              </div>
            </section>
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">Your homepage has no sections. Use “Add” to build it.</p>
          )}
        </div>
      </div>
    </EditorShell>
  );
}
