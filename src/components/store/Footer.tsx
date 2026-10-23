import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, Clock } from "lucide-react";
import type { NavigationSettings, StoreSettings } from "@/lib/settings-schema";
import NewsletterForm from "./NewsletterForm";
import Logo, { type LogoConfig } from "./Logo";
import { localTagline } from "@/lib/local-seo";

const PAYMENT_BADGES = ["UPI", "VISA", "Mastercard", "RuPay", "COD"];

export default function Footer({
  store,
  footer,
  logo,
  categories,
}: {
  store: StoreSettings;
  footer: NavigationSettings["footer"];
  logo: Omit<LogoConfig, "text">;
  categories: Array<{ name: string; slug: string }>;
}) {
  const year = new Date().getFullYear();
  const wordmark = footer.wordmarkText || store.logoText.split(" ")[0];
  const cols = footer.columns.length + (footer.showNewsletter ? 1 : 0);

  return (
    <footer className="mt-20 border-t border-luxury-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className={`container-page grid gap-10 py-14 sm:grid-cols-2 ${cols >= 3 ? "lg:grid-cols-5" : cols === 2 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <div className="space-y-4 lg:col-span-2">
          <Link href="/" className="inline-block text-lg tracking-[0.18em]">
            <Logo logo={{ ...logo, text: store.logoText }} />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-luxury-600 dark:text-zinc-400">{footer.about || store.tagline}</p>
          {localTagline(store) && <p className="max-w-sm text-xs text-luxury-500">{localTagline(store)}</p>}
          <ul className="space-y-2 text-sm text-luxury-700 dark:text-zinc-300">
            {store.address && (
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brand" />
                {store.local.mapUrl ? (
                  <a href={store.local.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{store.address}</a>
                ) : (
                  store.address
                )}
              </li>
            )}
            {store.contactPhone && (
              <li className="flex gap-2">
                <Phone size={16} className="mt-0.5 flex-shrink-0 text-brand" />
                <a href={`tel:${store.contactPhone.replace(/\s/g, "")}`} className="hover:underline">{store.contactPhone}</a>
              </li>
            )}
            <li className="flex gap-2">
              <Mail size={16} className="mt-0.5 flex-shrink-0 text-brand" />
              <a href={`mailto:${store.contactEmail}`} className="hover:underline">{store.contactEmail}</a>
            </li>
            {store.businessHours && (
              <li className="flex gap-2">
                <Clock size={16} className="mt-0.5 flex-shrink-0 text-brand" /> {store.businessHours}
              </li>
            )}
          </ul>
          <div className="flex gap-2 pt-1">
            {store.social.instagram && <Social href={store.social.instagram} label="Instagram"><Instagram size={16} /></Social>}
            {store.social.facebook && <Social href={store.social.facebook} label="Facebook"><Facebook size={16} /></Social>}
            {store.social.youtube && <Social href={store.social.youtube} label="YouTube"><Youtube size={16} /></Social>}
          </div>
        </div>

        {footer.columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-luxury-500">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.slice(0, 1).map((l) => <FooterLink key={l.label + l.href} {...l} />)}
              {col.autoCategories && categories.map((c) => <FooterLink key={c.slug} href={`/shop?category=${c.slug}`} label={c.name} />)}
              {col.links.slice(1).map((l) => <FooterLink key={l.label + l.href} {...l} />)}
            </ul>
          </div>
        ))}

        {footer.showNewsletter && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-luxury-500">{footer.newsletterTitle || "Newsletter"}</h3>
            {footer.newsletterText && <p className="text-sm text-luxury-600 dark:text-zinc-400">{footer.newsletterText}</p>}
            <NewsletterForm compact />
          </div>
        )}
      </div>

      {footer.showWordmark && wordmark && (
        <div className="container-page overflow-hidden" aria-hidden>
          <p className="select-none whitespace-nowrap text-center font-display text-[13vw] font-bold leading-[0.85] tracking-tight text-luxury-100 dark:text-zinc-800/60 lg:text-[10.5vw]">
            {wordmark}
          </p>
        </div>
      )}
      <div className="border-t border-luxury-100 dark:border-zinc-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-luxury-500 lg:flex-row">
          <p className="text-center">
            {footer.copyright || `© ${year} ${store.storeName}. All rights reserved.`}
            {store.gstin && ` · GSTIN ${store.gstin}`}
          </p>
          {footer.showPaymentIcons && (
            <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Payment methods we accept">
              {PAYMENT_BADGES.map((b) => (
                <li key={b} className="rounded border border-luxury-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-luxury-600 dark:border-zinc-700 dark:text-zinc-400">
                  {b}
                </li>
              ))}
            </ul>
          )}
          {footer.bottomLinks.length > 0 && (
            <div className="flex gap-4">
              {footer.bottomLinks.map((l) => (
                <Link key={l.label + l.href} href={l.href} className="hover:underline">{l.label}</Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="rounded-full border border-luxury-200 p-2 transition-colors hover:border-brand hover:text-brand dark:border-zinc-700">
      {children}
    </a>
  );
}

function FooterLink({ href, label, highlight }: { href: string; label: string; highlight?: boolean }) {
  return (
    <li>
      <Link href={href} className={`text-sm hover:underline ${highlight ? "font-semibold text-brand" : "text-luxury-700 hover:text-luxury-900 dark:text-zinc-300 dark:hover:text-white"}`}>
        {label}
      </Link>
    </li>
  );
}
