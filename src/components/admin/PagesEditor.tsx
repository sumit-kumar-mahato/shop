"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Field, FormError, Input, Textarea } from "@/components/ui/Form";
import { Panel } from "@/components/admin/ui";
import { SingleImageField } from "@/components/admin/ImageUploader";
import SettingsSaveBar from "@/components/admin/SettingsSaveBar";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { POLICY_PAGES, type PagesSettings, type PolicySlug } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

export default function PagesEditor({ initial }: { initial: PagesSettings }) {
  const { value: v, setValue: setV, dirty, saving, error, save, reset } = useSettingsForm("pages", initial);
  const [tab, setTab] = useState<"about" | PolicySlug>("about");
  const tabs: Array<["about" | PolicySlug, string]> = [["about", "About us"], ...(Object.entries(POLICY_PAGES) as Array<[PolicySlug, string]>)];

  return (
    <div className="space-y-6">
      <FormError message={error} />
      <div className="no-scrollbar flex gap-1 overflow-x-auto">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={cn("flex-shrink-0 rounded-full px-3 py-1.5 text-sm", tab === key ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "about" ? (
        <Panel title="About us" actions={<Link href="/about" target="_blank" className="flex items-center gap-1 text-sm hover:underline">View <ExternalLink size={12} /></Link>}>
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <SingleImageField value={v.about.image} onChange={(image) => setV({ ...v, about: { ...v.about, image } })} aspect="aspect-[4/5]" />
            <div className="space-y-4">
              <Field label="Title"><Input value={v.about.title} onChange={(e) => setV({ ...v, about: { ...v.about, title: e.target.value } })} /></Field>
              <Field label="Content" hint="Blank line between paragraphs. Start a line with ## for a heading.">
                <Textarea rows={16} value={v.about.body} onChange={(e) => setV({ ...v, about: { ...v.about, body: e.target.value } })} />
              </Field>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel title={POLICY_PAGES[tab]} actions={<Link href={`/policies/${tab}`} target="_blank" className="flex items-center gap-1 text-sm hover:underline">View <ExternalLink size={12} /></Link>}>
          <Field label="Content" hint="Blank line between paragraphs. Start a line with ## for a heading.">
            <Textarea rows={22} value={v.policies[tab]} onChange={(e) => setV({ ...v, policies: { ...v.policies, [tab]: e.target.value } })} className="font-mono text-[13px]" />
          </Field>
        </Panel>
      )}
      <SettingsSaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}
