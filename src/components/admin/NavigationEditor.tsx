"use client";

import { Columns3, Link2, Mail, Menu, Type } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Form";
import EditorShell, { type PreviewPath } from "@/components/admin/EditorShell";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { EditorSection, LinkInput, ListEditor, Toggle, type LinkSuggestion } from "@/components/admin/fields";
import type { NavigationSettings, NavLink } from "@/lib/settings-schema";

const newLink = (): NavLink => ({ label: "New link", href: "/shop", highlight: false });

function LinkFields({ link, update, suggestions, allowHighlight }: { link: NavLink; update: (p: Partial<NavLink>) => void; suggestions: LinkSuggestion[]; allowHighlight?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center">
      <Input className="h-10" value={link.label} onChange={(e) => update({ label: e.target.value })} aria-label="Link text" placeholder="Link text" />
      <LinkInput value={link.href} onChange={(href) => update({ href })} suggestions={suggestions} aria-label="Link address" />
      {allowHighlight && (
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-400">
          <input type="checkbox" checked={link.highlight} onChange={(e) => update({ highlight: e.target.checked })} className="accent-zinc-900" /> Highlight
        </label>
      )}
    </div>
  );
}

export default function NavigationEditor({ initial, suggestions, previewPaths }: { initial: NavigationSettings; suggestions: LinkSuggestion[]; previewPaths: PreviewPath[] }) {
  const form = useSettingsForm("navigation", initial);
  const v = form.value;
  const setFooter = (patch: Partial<NavigationSettings["footer"]>) => form.setValue({ ...v, footer: { ...v.footer, ...patch } });

  return (
    <EditorShell {...form} onSave={() => void form.save()} onReset={form.reset} previewPaths={previewPaths}>
      <EditorSection title="Header menu" description="Links next to the logo. The first three sit on the left, the rest on the right of wide screens." icon={<Menu size={18} />}>
        <ListEditor
          items={v.headerLinks}
          onChange={(headerLinks) => form.setValue({ ...v, headerLinks })}
          create={newLink}
          max={8}
          addLabel="Add menu link"
          compact
          render={(link, update) => <LinkFields link={link} update={update} suggestions={suggestions} allowHighlight />}
        />
        <p className="text-xs text-zinc-500">“Highlight” shows the link in your brand colour — good for Sale or Offers.</p>
      </EditorSection>

      <EditorSection title="Footer columns" description="Up to 4 columns of links" icon={<Columns3 size={18} />}>
        <ListEditor
          items={v.footer.columns}
          onChange={(columns) => setFooter({ columns })}
          create={() => ({ title: "New column", autoCategories: false, links: [newLink()] })}
          max={4}
          addLabel="Add column"
          itemLabel={(c) => c.title || "Untitled column"}
          render={(col, update) => (
            <div className="space-y-4">
              <Field label="Column title">
                <Input className="h-10" value={col.title} onChange={(e) => update({ title: e.target.value })} />
              </Field>
              <Toggle label="List categories automatically" hint="Adds your first 6 categories after the first link." checked={col.autoCategories} onChange={(autoCategories) => update({ autoCategories })} />
              <ListEditor items={col.links} onChange={(links) => update({ links })} create={newLink} max={12} addLabel="Add link" compact render={(link, u) => <LinkFields link={link} update={u} suggestions={suggestions} allowHighlight />} />
            </div>
          )}
        />
      </EditorSection>

      <EditorSection title="Footer text" icon={<Type size={18} />}>
        <Field label="About text" hint="Under the logo. Leave empty to use your store tagline.">
          <Textarea rows={2} value={v.footer.about} onChange={(e) => setFooter({ about: e.target.value })} />
        </Field>
        <Toggle label="Giant brand name at the bottom" checked={v.footer.showWordmark} onChange={(showWordmark) => setFooter({ showWordmark })} />
        {v.footer.showWordmark && (
          <Field label="Brand name text" hint="Leave empty to use the first word of your logo text.">
            <Input value={v.footer.wordmarkText} onChange={(e) => setFooter({ wordmarkText: e.target.value })} />
          </Field>
        )}
        <Toggle label="Payment method badges (UPI, Visa, Mastercard, RuPay, COD)" checked={v.footer.showPaymentIcons} onChange={(showPaymentIcons) => setFooter({ showPaymentIcons })} />
        <Field label="Copyright line" hint="Leave empty for “© year Store name. All rights reserved.”">
          <Input value={v.footer.copyright} onChange={(e) => setFooter({ copyright: e.target.value })} />
        </Field>
      </EditorSection>

      <EditorSection title="Footer newsletter" icon={<Mail size={18} />}>
        <Toggle label="Show newsletter sign-up in the footer" checked={v.footer.showNewsletter} onChange={(showNewsletter) => setFooter({ showNewsletter })} />
        {v.footer.showNewsletter && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={v.footer.newsletterTitle} onChange={(e) => setFooter({ newsletterTitle: e.target.value })} /></Field>
            <Field label="Text"><Input value={v.footer.newsletterText} onChange={(e) => setFooter({ newsletterText: e.target.value })} /></Field>
          </div>
        )}
      </EditorSection>

      <EditorSection title="Bottom links" description="Small links in the very last row (e.g. Privacy, Terms)" icon={<Link2 size={18} />}>
        <ListEditor items={v.footer.bottomLinks} onChange={(bottomLinks) => setFooter({ bottomLinks })} create={newLink} max={6} addLabel="Add link" compact render={(link, update) => <LinkFields link={link} update={update} suggestions={suggestions} />} />
      </EditorSection>
    </EditorShell>
  );
}
