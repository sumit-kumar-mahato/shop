import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { textBlocks } from "@/lib/utils";
import { LinkButton } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const pages = await getSettings("pages");
  return { title: pages.about.title };
}

export default async function AboutPage() {
  const [pages, store] = await Promise.all([getSettings("pages"), getSettings("store")]);
  return (
    <div className="container-page py-12">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        {pages.about.image && (
          <div className="aspect-[4/5] overflow-hidden bg-luxury-100 lg:sticky lg:top-28">
            <img src={pages.about.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{store.storeName}</p>
          <h1 className="mb-8 mt-2 font-serif text-4xl sm:text-5xl">{pages.about.title}</h1>
          <div className="prose-store text-base">
            {textBlocks(pages.about.body).map((b, i) => (b.type === "h" ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>))}
          </div>
          <div className="mt-8 flex gap-3">
            <LinkButton href="/shop">Shop the collection</LinkButton>
            <LinkButton href="/contact" variant="outline">Contact us</LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
