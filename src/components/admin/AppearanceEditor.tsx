"use client";

import { CaseSensitive, Image as ImageIcon, LayoutGrid, Moon, Palette, PanelTop, Shapes, Sparkles } from "lucide-react";
import { Field } from "@/components/ui/Form";
import { SingleImageField } from "@/components/admin/ImageUploader";
import EditorShell, { type PreviewPath } from "@/components/admin/EditorShell";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { ChoiceCards, ColorField, EditorSection, Segmented, Slider, Toggle } from "@/components/admin/fields";
import { BODY_FONTS, CARD_RATIOS, HEADING_FONTS, LOGO_FONTS, type ThemeSettings } from "@/lib/settings-schema";
import { contrastTextTriplet, hexToRgbTriplet } from "@/lib/utils";

const RATIO_CLS: Record<keyof typeof CARD_RATIOS, string> = { portrait: "aspect-[3/4]", classic: "aspect-[4/5]", tall: "aspect-[2/3]", square: "aspect-square" };
const RADIUS = { sharp: "2px", soft: "8px", rounded: "16px" };
const BTN_RADIUS = { pill: "9999px", rounded: "10px", square: "2px" };
const font = (key: string) => ({ fontFamily: `var(--f-${key})` });

export default function AppearanceEditor({ initial, logoText, previewPaths }: { initial: ThemeSettings; logoText: string; previewPaths: PreviewPath[] }) {
  const form = useSettingsForm("theme", initial);
  const v = form.value;
  const set = <K extends keyof ThemeSettings>(k: K, val: ThemeSettings[K]) => form.setValue({ ...v, [k]: val });
  const fg = `rgb(${contrastTextTriplet(v.primaryColor)})`;
  const brandRgb = hexToRgbTriplet(v.primaryColor);

  return (
    <EditorShell {...form} onSave={() => void form.save()} onReset={form.reset} previewPaths={previewPaths}>
      <EditorSection title="Brand colour" description="Buttons, badges, highlights and links across the store" icon={<Palette size={18} />}>
        <div className="grid gap-6 sm:grid-cols-2">
          <ColorField value={v.primaryColor} onChange={(c) => set("primaryColor", c)} />
          <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: v.primaryColor }}>New season</p>
            <p className="text-xl" style={font(v.headingFont)}>Sample heading</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-2 text-sm font-semibold" style={{ background: v.primaryColor, color: fg, borderRadius: BTN_RADIUS[v.buttons] }}>Add to bag</span>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase" style={{ background: v.primaryColor, color: fg }}>−20%</span>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase" style={{ background: `rgb(${brandRgb} / 0.15)` }}>Tag</span>
            </div>
          </div>
        </div>
      </EditorSection>

      <EditorSection title="Typography" description="Fonts for headings, body text and the logo" icon={<CaseSensitive size={18} />}>
        <Field label="Headings">
          <ChoiceCards
            value={v.headingFont}
            onChange={(f) => set("headingFont", f)}
            columns={3}
            options={(Object.keys(HEADING_FONTS) as Array<keyof typeof HEADING_FONTS>).map((k) => ({
              value: k,
              label: HEADING_FONTS[k],
              sample: <span className="text-2xl leading-tight" style={font(k)}>The Summer Couture</span>,
            }))}
          />
        </Field>
        <Field label="Body text">
          <ChoiceCards
            value={v.bodyFont}
            onChange={(f) => set("bodyFont", f)}
            columns={3}
            options={(Object.keys(BODY_FONTS) as Array<keyof typeof BODY_FONTS>).map((k) => ({
              value: k,
              label: BODY_FONTS[k],
              sample: <span className="text-sm leading-snug" style={font(k)}>Handwoven linen, breathable and soft — made to last.</span>,
            }))}
          />
        </Field>
        <Field label="Logo text" hint="Used when you haven't uploaded a logo image">
          <ChoiceCards
            value={v.logoFont}
            onChange={(f) => set("logoFont", f)}
            columns={3}
            options={(Object.keys(LOGO_FONTS) as Array<keyof typeof LOGO_FONTS>).map((k) => ({
              value: k,
              label: LOGO_FONTS[k],
              sample: <span className="block truncate text-base font-bold tracking-[0.2em]" style={font(k)}>{logoText}</span>,
            }))}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Shapes" description="Corner style for images, cards and fields, and the shape of buttons" icon={<Shapes size={18} />}>
        <Field label="Corners">
          <ChoiceCards
            value={v.corners}
            onChange={(c) => set("corners", c)}
            columns={3}
            options={(["sharp", "soft", "rounded"] as const).map((k) => ({
              value: k,
              label: k === "sharp" ? "Sharp — editorial" : k === "soft" ? "Soft — balanced" : "Rounded — friendly",
              sample: <span className="block h-14 border-2 border-zinc-900 bg-zinc-100 dark:border-white dark:bg-zinc-800" style={{ borderRadius: RADIUS[k] }} />,
            }))}
          />
        </Field>
        <Field label="Buttons">
          <ChoiceCards
            value={v.buttons}
            onChange={(b) => set("buttons", b)}
            columns={3}
            options={(["pill", "rounded", "square"] as const).map((k) => ({
              value: k,
              label: k === "pill" ? "Pill" : k === "rounded" ? "Rounded" : "Square",
              sample: <span className="inline-block px-5 py-2.5 text-xs font-semibold" style={{ background: v.primaryColor, color: fg, borderRadius: BTN_RADIUS[k] }}>Shop now</span>,
            }))}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Logo & browser icon" description="Upload your logo (PNG with a transparent background works best)" icon={<ImageIcon size={18} />}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Logo" hint="Shown in the header and footer. Leave empty to use your logo text.">
            <SingleImageField value={v.logo.image} onChange={(image) => set("logo", { ...v.logo, image })} aspect="aspect-[3/1]" />
          </Field>
          <Field label="Logo for dark backgrounds" hint="Optional light version, used over the homepage banner and in dark mode.">
            <div className="rounded-md bg-zinc-900 p-1">
              <SingleImageField value={v.logo.darkImage} onChange={(darkImage) => set("logo", { ...v.logo, darkImage })} aspect="aspect-[3/1]" />
            </div>
          </Field>
        </div>
        <Field label="Logo height">
          <Slider value={v.logo.height} min={16} max={96} onChange={(height) => set("logo", { ...v.logo, height })} suffix="px" />
        </Field>
        <Field label="Browser tab icon (favicon)" hint="A square image, at least 64 × 64 pixels." className="max-w-[200px]">
          <SingleImageField value={v.favicon} onChange={(favicon) => set("favicon", favicon)} aspect="aspect-square" />
        </Field>
      </EditorSection>

      <EditorSection title="Header" icon={<PanelTop size={18} />}>
        <Toggle label="See-through header over the homepage banner" hint="The header turns solid as visitors scroll." checked={v.header.transparentOnHero} onChange={(transparentOnHero) => set("header", { ...v.header, transparentOnHero })} />
        <Toggle label="Mega menu" hint="“Shop” opens a large menu with all categories and photos." checked={v.header.megaMenu} onChange={(megaMenu) => set("header", { ...v.header, megaMenu })} />
      </EditorSection>

      <EditorSection title="Product cards" description="How products look in grids and carousels" icon={<LayoutGrid size={18} />}>
        <Field label="Photo shape">
          <ChoiceCards
            value={v.productCard.imageRatio}
            onChange={(imageRatio) => set("productCard", { ...v.productCard, imageRatio })}
            columns={4}
            options={(Object.keys(CARD_RATIOS) as Array<keyof typeof CARD_RATIOS>).map((k) => ({
              value: k,
              label: CARD_RATIOS[k],
              sample: <span className={`mx-auto block w-14 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 ${RATIO_CLS[k]}`} style={{ borderRadius: RADIUS[v.corners] }} />,
            }))}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Toggle label="Show second photo on hover" checked={v.productCard.hoverImage} onChange={(hoverImage) => set("productCard", { ...v.productCard, hoverImage })} />
          <Toggle label="“Quick add” button" checked={v.productCard.quickAdd} onChange={(quickAdd) => set("productCard", { ...v.productCard, quickAdd })} />
          <Toggle label="Star rating" checked={v.productCard.showRating} onChange={(showRating) => set("productCard", { ...v.productCard, showRating })} />
          <Toggle label="Category name" checked={v.productCard.showCategory} onChange={(showCategory) => set("productCard", { ...v.productCard, showCategory })} />
          <Toggle label="Colour dots" checked={v.productCard.showColors} onChange={(showColors) => set("productCard", { ...v.productCard, showColors })} />
        </div>
        <Field label="“Only N left” badge" hint="Shown when total stock is at or below this number. 0 turns it off.">
          <Slider value={v.productCard.lowStockBadgeAt} min={0} max={20} onChange={(lowStockBadgeAt) => set("productCard", { ...v.productCard, lowStockBadgeAt })} />
        </Field>
      </EditorSection>

      <EditorSection title="Light & dark mode" icon={<Moon size={18} />}>
        <Field label="Default for visitors">
          <Segmented
            value={v.colorMode}
            onChange={(colorMode) => set("colorMode", colorMode)}
            options={[
              { value: "system", label: "Match their device" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Field>
        <Toggle label="Let visitors switch between light and dark" checked={v.allowThemeToggle} onChange={(allowThemeToggle) => set("allowThemeToggle", allowThemeToggle)} />
      </EditorSection>

      <EditorSection title="Motion" icon={<Sparkles size={18} />}>
        <Toggle
          label="Animations"
          hint="Sections fade in while scrolling, banner photos slowly zoom and headlines slide in. Visitors who ask their device for reduced motion never see them."
          checked={v.animations}
          onChange={(animations) => set("animations", animations)}
        />
      </EditorSection>
    </EditorShell>
  );
}
