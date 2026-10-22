"use client";

import Link from "next/link";
import { Gift, MessageCircle, Truck } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { SingleImageField } from "@/components/admin/ImageUploader";
import EditorShell, { type PreviewPath } from "@/components/admin/EditorShell";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { EditorSection, LinkInput, Segmented, Slider, Toggle, type LinkSuggestion } from "@/components/admin/fields";
import type { EngagementSettings } from "@/lib/settings-schema";

export default function EngagementEditor({
  initial,
  whatsappNumber,
  coupons,
  suggestions,
  previewPaths,
}: {
  initial: EngagementSettings;
  whatsappNumber: string;
  coupons: string[];
  suggestions: LinkSuggestion[];
  previewPaths: PreviewPath[];
}) {
  const form = useSettingsForm("engagement", initial);
  const v = form.value;
  const p = v.popup;
  const setPopup = (patch: Partial<EngagementSettings["popup"]>) => form.setValue({ ...v, popup: { ...p, ...patch } });
  const unknownCoupon = p.couponCode && !coupons.includes(p.couponCode.toUpperCase());

  return (
    <EditorShell {...form} onSave={() => void form.save()} onReset={form.reset} previewPaths={previewPaths}>
      <EditorSection title="Welcome popup" description="A one-time offer for new visitors — great for growing your mailing list" icon={<Gift size={18} />}>
        <Toggle label="Show the popup" checked={p.enabled} onChange={(enabled) => setPopup({ enabled })} />
        <div className={p.enabled ? "space-y-5" : "pointer-events-none space-y-5 opacity-50"}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Show on">
              <Segmented value={p.showOn} onChange={(showOn) => setPopup({ showOn })} options={[{ value: "home", label: "Homepage only" }, { value: "all", label: "Any page" }]} />
            </Field>
            <Field label="Wait before showing">
              <Slider value={p.delaySeconds} min={0} max={60} onChange={(delaySeconds) => setPopup({ delaySeconds })} suffix="s" />
            </Field>
            <Field label="Show again after" hint="The same visitor won't see it again for this many days.">
              <Slider value={p.frequencyDays} min={1} max={90} onChange={(frequencyDays) => setPopup({ frequencyDays })} suffix=" d" />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <Field label="Image" hint="Hidden on phones."><SingleImageField value={p.image} onChange={(image) => setPopup({ image })} aspect="aspect-[4/5]" /></Field>
            <div className="space-y-4">
              <Field label="Small heading"><Input value={p.eyebrow} onChange={(e) => setPopup({ eyebrow: e.target.value })} /></Field>
              <Field label="Headline"><Input value={p.title} onChange={(e) => setPopup({ title: e.target.value })} /></Field>
              <Field label="Text"><Textarea rows={2} value={p.text} onChange={(e) => setPopup({ text: e.target.value })} /></Field>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Coupon code to show"
              hint={unknownCoupon ? <span className="text-amber-600">No coupon with this code exists yet — <Link href="/admin/coupons" className="underline">create it</Link>.</span> : "Optional. Visitors can copy it with one tap."}
            >
              <Input value={p.couponCode} onChange={(e) => setPopup({ couponCode: e.target.value.toUpperCase() })} list="popup-coupons" className="font-mono" />
              <datalist id="popup-coupons">
                {coupons.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <div className="pt-6">
              <Toggle label="Ask for their email (newsletter sign-up)" checked={p.collectEmail} onChange={(collectEmail) => setPopup({ collectEmail })} />
            </div>
            <Field label="Button text" hint="Optional"><Input value={p.buttonText} onChange={(e) => setPopup({ buttonText: e.target.value })} /></Field>
            <Field label="Button link"><LinkInput value={p.link} onChange={(link) => setPopup({ link })} suggestions={suggestions} /></Field>
          </div>
          <p className="text-xs text-zinc-500">Tip: in the live preview the popup appears straight away, every time.</p>
        </div>
      </EditorSection>

      <EditorSection title="WhatsApp chat button" description="A floating button that opens a WhatsApp chat with you" icon={<MessageCircle size={18} />}>
        {!whatsappNumber && (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Add your WhatsApp number in <Link href="/admin/settings" className="font-semibold underline">Store settings</Link> first — the button stays hidden until then.
          </p>
        )}
        <Toggle label="Show WhatsApp button" checked={v.whatsapp.enabled} onChange={(enabled) => form.setValue({ ...v, whatsapp: { ...v.whatsapp, enabled } })} />
        <Field label="Pre-filled message"><Input value={v.whatsapp.message} onChange={(e) => form.setValue({ ...v, whatsapp: { ...v.whatsapp, message: e.target.value } })} /></Field>
      </EditorSection>

      <EditorSection title="Shopping bag" icon={<Truck size={18} />}>
        <Toggle label="Free-shipping progress bar" hint="“Add ₹X more for free shipping” at the top of the shopping bag." checked={v.freeShippingBar} onChange={(freeShippingBar) => form.setValue({ ...v, freeShippingBar })} />
      </EditorSection>
    </EditorShell>
  );
}
