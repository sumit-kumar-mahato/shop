import type { StoreSettings } from "@/lib/settings-schema";

// Helpers that describe the physical shop in plain words, so search engines can connect the website with
// the names customers use ("Prabodh Mahato Shop", "Mahato Shop") and with the places it serves (Chowka…).
// Everything comes from Admin → Store settings → Local search.

const join = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

/** "Chowka, Jharkhand" (skips empty parts). */
export function placeName(store: StoreSettings) {
  return [store.local.locality, store.local.district, store.local.region].filter(Boolean).join(", ");
}

/** One line for the footer, e.g. "Clothing store in Chowka, Jharkhand · also known as Prabodh Mahato Shop". */
export function localTagline(store: StoreSettings) {
  const place = placeName(store);
  const aka = store.local.alsoKnownAs.slice(0, 3);
  return [place && `Clothing store in ${place}`, aka.length > 0 && `also known as ${join(aka)}`].filter(Boolean).join(" · ");
}

/** Paragraphs for the "About our store" section on the homepage. */
export function localIntro(store: StoreSettings, categories: string[]): { heading: string; paragraphs: string[] } {
  const place = placeName(store);
  const heading = place ? `${store.storeName} — clothing store in ${store.local.locality || place}` : store.storeName;
  if (store.local.intro.trim()) return { heading, paragraphs: store.local.intro.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) };

  const aka = store.local.alsoKnownAs;
  const areas = store.local.areasServed.filter((a) => a.toLowerCase() !== store.local.locality.toLowerCase());
  const where = [place, store.local.postalCode].filter(Boolean).join(" ");
  const paragraphs = [
    `${store.storeName}${aka.length ? ` (also known as ${join(aka)})` : ""} is a clothing shop${where ? ` in ${where}` : ""}. ${store.tagline}`.trim(),
    categories.length
      ? `Shop ${join(categories.slice(0, 8).map((c) => c.toLowerCase()))} online with delivery across India${store.local.locality ? `, or visit the shop in ${store.local.locality}` : ""}.`
      : "",
    areas.length ? `We are proud to serve customers from ${join(areas)}${store.local.region ? ` and all over ${store.local.region}` : ""}.` : "",
  ].filter(Boolean);
  return { heading, paragraphs };
}

/** Extra keywords for the meta keywords tag (used lightly by Bing; ignored by Google). */
export function localKeywords(store: StoreSettings, categories: string[] = []) {
  const place = store.local.locality;
  return [
    store.storeName,
    ...store.local.alsoKnownAs,
    ...(place ? [`clothing store ${place}`, `clothes shop ${place}`, ...categories.map((c) => `${c} ${place}`)] : []),
    ...store.local.areasServed,
  ];
}

/** schema.org fields for the shop's ClothingStore entry. */
export function localBusinessFields(store: StoreSettings) {
  const l = store.local;
  return {
    ...(l.alsoKnownAs.length ? { alternateName: l.alsoKnownAs } : {}),
    ...(store.address || l.locality
      ? {
          address: {
            "@type": "PostalAddress",
            ...(store.address ? { streetAddress: store.address } : {}),
            ...(l.locality ? { addressLocality: l.locality } : {}),
            ...(l.region ? { addressRegion: l.region } : {}),
            ...(l.postalCode ? { postalCode: l.postalCode } : {}),
            addressCountry: "IN",
          },
        }
      : {}),
    ...(l.areasServed.length ? { areaServed: l.areasServed.map((name) => ({ "@type": "Place", name })) } : {}),
    ...(l.mapUrl ? { hasMap: l.mapUrl } : {}),
  };
}
