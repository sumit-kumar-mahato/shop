import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube, Clock } from "lucide-react";
import type { StoreSettings } from "@/lib/settings-schema";
import NewsletterForm from "./NewsletterForm";

export default function Footer({ store, categories }: { store: StoreSettings; categories: Array<{ name: string; slug: string }> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-luxury-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <p className="font-display text-lg font-bold tracking-[0.18em]">{store.logoText}</p>
          <p className="max-w-sm text-sm leading-relaxed text-luxury-600 dark:text-zinc-400">{store.tagline}</p>
          <ul className="space-y-2 text-sm text-luxury-700 dark:text-zinc-300">
            {store.address && (
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brand" /> {store.address}
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
            {store.social.instagram && (
              <a href={store.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full border border-luxury-200 p-2 hover:border-brand hover:text-brand dark:border-zinc-700">
                <Instagram size={16} />
              </a>
            )}
            {store.social.facebook && (
              <a href={store.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full border border-luxury-200 p-2 hover:border-brand hover:text-brand dark:border-zinc-700">
                <Facebook size={16} />
              </a>
            )}
            {store.social.youtube && (
              <a href={store.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="rounded-full border border-luxury-200 p-2 hover:border-brand hover:text-brand dark:border-zinc-700">
                <Youtube size={16} />
              </a>
            )}
          </div>
        </div>

        <FooterCol title="Shop">
          <FooterLink href="/shop">All products</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.slug} href={`/shop?category=${c.slug}`}>{c.name}</FooterLink>
          ))}
          <FooterLink href="/offers">Offers</FooterLink>
        </FooterCol>

        <FooterCol title="Help">
          <FooterLink href="/account/orders">Track your order</FooterLink>
          <FooterLink href="/policies/shipping">Shipping</FooterLink>
          <FooterLink href="/policies/returns">Returns & refunds</FooterLink>
          <FooterLink href="/contact">Contact us</FooterLink>
          <FooterLink href="/about">About us</FooterLink>
          <FooterLink href="/blog">Journal</FooterLink>
        </FooterCol>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-luxury-500">Newsletter</h3>
          <p className="text-sm text-luxury-600 dark:text-zinc-400">New arrivals and private offers, straight to your inbox.</p>
          <NewsletterForm compact />
        </div>
      </div>

      <div className="border-t border-luxury-100 dark:border-zinc-800">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-luxury-500 sm:flex-row">
          <p>
            © {year} {store.storeName}. All rights reserved.{store.gstin && ` · GSTIN ${store.gstin}`}
          </p>
          <div className="flex gap-4">
            <Link href="/policies/privacy" className="hover:underline">Privacy</Link>
            <Link href="/policies/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-luxury-500">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-luxury-700 hover:text-luxury-900 hover:underline dark:text-zinc-300 dark:hover:text-white">
        {children}
      </Link>
    </li>
  );
}
