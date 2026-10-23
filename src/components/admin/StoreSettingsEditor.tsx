"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Checkbox, Field, FormError, Input, Textarea } from "@/components/ui/Form";
import { Panel } from "@/components/admin/ui";
import SettingsSaveBar from "@/components/admin/SettingsSaveBar";
import { useSettingsForm } from "@/components/admin/useSettingsForm";
import { TagInput } from "@/components/admin/fields";
import { localTagline } from "@/lib/local-seo";
import type { StoreSettings } from "@/lib/settings-schema";

const rupees = (paise: number) => String(paise / 100);
const paise = (rupeesStr: string) => Math.max(0, Math.round((parseFloat(rupeesStr) || 0) * 100));

export default function StoreSettingsEditor({ initial, integrations }: { initial: StoreSettings; integrations: { razorpay: boolean; email: boolean } }) {
  const { value: v, setValue: setV, dirty, saving, error, save, reset } = useSettingsForm("store", initial);
  const set = <K extends keyof StoreSettings>(k: K, val: StoreSettings[K]) => setV({ ...v, [k]: val });

  return (
    <div className="space-y-6">
      <FormError message={error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Branding">
          <div className="space-y-4">
            <Field label="Store name" hint="Used in page titles, emails and invoices"><Input value={v.storeName} onChange={(e) => set("storeName", e.target.value)} /></Field>
            <Field label="Logo text" hint="Shown in the header"><Input value={v.logoText} onChange={(e) => set("logoText", e.target.value)} /></Field>
            <Field label="Tagline"><Input value={v.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
              Colours, fonts, logo image and layout options are under{" "}
              <Link href="/admin/appearance" className="font-semibold text-zinc-900 underline dark:text-white">Appearance</Link>.
            </p>
          </div>
        </Panel>

        <Panel title="Contact & business details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><Input type="email" value={v.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></Field>
            <Field label="Phone"><Input value={v.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
            <Field label="WhatsApp number" hint="With country code, e.g. 919876543210"><Input value={v.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} /></Field>
            <Field label="GSTIN" hint="Printed on invoices"><Input value={v.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} /></Field>
            <Field label="Store address" className="sm:col-span-2"><Textarea rows={2} value={v.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="Business hours" className="sm:col-span-2"><Input value={v.businessHours} onChange={(e) => set("businessHours", e.target.value)} /></Field>
          </div>
        </Panel>

        <Panel title="Announcement bar" description="Thin strip at the very top of every page">
          <div className="space-y-4">
            <Checkbox label="Show announcement bar" checked={v.announcement.enabled} onChange={(e) => set("announcement", { ...v.announcement, enabled: e.target.checked })} />
            <Field label="Message"><Input value={v.announcement.text} onChange={(e) => set("announcement", { ...v.announcement, text: e.target.value })} /></Field>
            <Field label="Link (optional)" hint="e.g. /offers"><Input value={v.announcement.link} onChange={(e) => set("announcement", { ...v.announcement, link: e.target.value })} /></Field>
          </div>
        </Panel>

        <Panel title="Social links">
          <div className="space-y-4">
            <Field label="Instagram"><Input value={v.social.instagram} onChange={(e) => set("social", { ...v.social, instagram: e.target.value })} placeholder="https://instagram.com/yourstore" /></Field>
            <Field label="Facebook"><Input value={v.social.facebook} onChange={(e) => set("social", { ...v.social, facebook: e.target.value })} /></Field>
            <Field label="YouTube"><Input value={v.social.youtube} onChange={(e) => set("social", { ...v.social, youtube: e.target.value })} /></Field>
          </div>
        </Panel>

        <Panel title="Shipping">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shipping fee (₹)" hint="Charged on orders below the free-shipping amount">
              <Input type="number" min={0} value={rupees(v.shipping.flatFee)} onChange={(e) => set("shipping", { ...v.shipping, flatFee: paise(e.target.value) })} />
            </Field>
            <Field label="Free shipping from (₹)" hint="0 = never free">
              <Input type="number" min={0} value={rupees(v.shipping.freeShippingThreshold)} onChange={(e) => set("shipping", { ...v.shipping, freeShippingThreshold: paise(e.target.value) })} />
            </Field>
            <Field label="Delivery estimate" className="sm:col-span-2"><Input value={v.shipping.estimatedDelivery} onChange={(e) => set("shipping", { ...v.shipping, estimatedDelivery: e.target.value })} /></Field>
          </div>
        </Panel>

        <Panel title="Tax (GST)">
          <div className="space-y-4">
            <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
              Not GST-registered? Set the rate to 0 and leave GSTIN empty — invoices will then not show GST.
            </p>
            <Field label="GST rate (%)"><Input type="number" min={0} max={40} step="0.5" value={v.tax.ratePercent} onChange={(e) => set("tax", { ...v.tax, ratePercent: parseFloat(e.target.value) || 0 })} /></Field>
            <Checkbox
              label="My prices already include GST (recommended — standard for MRP pricing in India)"
              checked={v.tax.pricesIncludeTax}
              onChange={(e) => set("tax", { ...v.tax, pricesIncludeTax: e.target.checked })}
            />
          </div>
        </Panel>

        <Panel title="Payments">
          <div className="space-y-4">
            <Checkbox label="Accept Cash on Delivery" checked={v.payments.codEnabled} onChange={(e) => set("payments", { ...v.payments, codEnabled: e.target.checked })} />
            <Field label="Maximum COD order value (₹)" hint="0 = no limit">
              <Input type="number" min={0} value={rupees(v.payments.codMaxOrderValue)} onChange={(e) => set("payments", { ...v.payments, codMaxOrderValue: paise(e.target.value) })} disabled={!v.payments.codEnabled} />
            </Field>
            <Checkbox label="Accept online payments (UPI, cards, net banking)" checked={v.payments.onlineEnabled} onChange={(e) => set("payments", { ...v.payments, onlineEnabled: e.target.checked })} />
            <Status ok={integrations.razorpay} okText="Razorpay is connected." badText="Razorpay keys are not configured on the server — online payment is hidden until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set." />
          </div>
        </Panel>

        <Panel title="Orders & customers">
          <div className="space-y-4">
            <Field label="Return window (days)" hint="0 = returns disabled">
              <Input type="number" min={0} max={60} value={v.orders.returnWindowDays} onChange={(e) => set("orders", { ...v.orders, returnWindowDays: parseInt(e.target.value, 10) || 0 })} />
            </Field>
            <Field label="Low-stock alert at" hint="Variants at or below this stock appear on the dashboard">
              <Input type="number" min={0} value={v.orders.lowStockThreshold} onChange={(e) => set("orders", { ...v.orders, lowStockThreshold: parseInt(e.target.value, 10) || 0 })} />
            </Field>
            <Field label="Send new-order alerts to" hint="Leave empty to use the store contact email">
              <Input type="email" value={v.orders.notifyEmail} onChange={(e) => set("orders", { ...v.orders, notifyEmail: e.target.value })} />
            </Field>
            <Checkbox label="Customers must verify their email before ordering" checked={v.orders.requireEmailVerification} onChange={(e) => set("orders", { ...v.orders, requireEmailVerification: e.target.checked })} />
            <Status ok={integrations.email} okText="Email sending is configured." badText="SMTP is not configured — emails are written to the server log instead of being sent. Keep email verification off until SMTP is set up." />
          </div>
        </Panel>

        <Panel title="Local search (Google)" description="Help people find you by your shop's other names and by place — e.g. “Prabodh Mahato shop” or “clothes shop Chowka”." className="lg:col-span-2">
          <div className="space-y-4">
            <Field label="Other names people use for your shop" hint="Type a name and press Enter. Shown on the site and given to Google as your shop's other names.">
              <TagInput value={v.local.alsoKnownAs} onChange={(alsoKnownAs) => set("local", { ...v.local, alsoKnownAs })} placeholder="e.g. Prabodh Mahato Shop" max={10} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Town / village"><Input value={v.local.locality} onChange={(e) => set("local", { ...v.local, locality: e.target.value })} placeholder="Chowka" /></Field>
              <Field label="District" hint="Optional"><Input value={v.local.district} onChange={(e) => set("local", { ...v.local, district: e.target.value })} /></Field>
              <Field label="State"><Input value={v.local.region} onChange={(e) => set("local", { ...v.local, region: e.target.value })} /></Field>
              <Field label="PIN code"><Input value={v.local.postalCode} onChange={(e) => set("local", { ...v.local, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) })} inputMode="numeric" /></Field>
            </div>
            <Field label="Nearby towns and villages you serve" hint="Where your customers come from. Type a place and press Enter.">
              <TagInput value={v.local.areasServed} onChange={(areasServed) => set("local", { ...v.local, areasServed })} placeholder="e.g. Kurli" />
            </Field>
            <Field label="Google Maps link to your shop" hint="Open your shop in Google Maps → Share → Copy link. Adds “Get directions” to the site.">
              <Input value={v.local.mapUrl} onChange={(e) => set("local", { ...v.local, mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
            </Field>
            <Checkbox label="Show an “About our store” section at the bottom of the homepage (recommended — Google ranks what visitors can read)" checked={v.local.showOnHomepage} onChange={(e) => set("local", { ...v.local, showOnHomepage: e.target.checked })} />
            {v.local.showOnHomepage && (
              <Field label="Your own text for that section (optional)" hint="Leave empty and it's written for you from the details above. Blank line between paragraphs.">
                <Textarea rows={3} value={v.local.intro} onChange={(e) => set("local", { ...v.local, intro: e.target.value })} />
              </Field>
            )}
            <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
              Every page footer will say: <strong className="text-zinc-900 dark:text-white">{localTagline(v) || "—"}</strong>
            </p>
          </div>
        </Panel>

        <Panel title="Search engines (SEO)" className="lg:col-span-2">
          <div className="space-y-4">
            <Field label="Homepage title" hint="What Google shows as the blue link. Include your shop name, “shop” or “store”, and your town — under 60 characters."><Input value={v.seo.title} onChange={(e) => set("seo", { ...v.seo, title: e.target.value })} maxLength={120} /></Field>
            <Field label="Homepage description"><Textarea rows={2} value={v.seo.description} onChange={(e) => set("seo", { ...v.seo, description: e.target.value })} maxLength={300} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Google Search Console code" hint="From Search Console → Add property → HTML tag. Paste the code or the whole tag.">
                <Input value={v.seo.googleVerification} onChange={(e) => set("seo", { ...v.seo, googleVerification: e.target.value })} placeholder="e.g. AbC123…" className="font-mono" />
              </Field>
              <Field label="Bing Webmaster code (optional)" hint="Also covers Yahoo and DuckDuckGo.">
                <Input value={v.seo.bingVerification} onChange={(e) => set("seo", { ...v.seo, bingVerification: e.target.value })} className="font-mono" />
              </Field>
            </div>
          </div>
        </Panel>
      </div>
      <SettingsSaveBar dirty={dirty} saving={saving} onSave={() => void save()} onReset={reset} />
    </div>
  );
}

function Status({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <p className={`flex items-start gap-2 rounded-md p-3 text-xs ${ok ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>
      {ok ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" /> : <XCircle size={14} className="mt-0.5 flex-shrink-0" />}
      {ok ? okText : badText}
    </p>
  );
}
