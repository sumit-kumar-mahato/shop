import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { POLICY_PAGES, type PolicySlug } from "@/lib/settings-schema";
import { cn, textBlocks } from "@/lib/utils";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const title = POLICY_PAGES[params.slug as PolicySlug];
  return { title: title ?? "Policy" };
}

export default async function PolicyPage({ params }: Props) {
  if (!(params.slug in POLICY_PAGES)) notFound();
  const slug = params.slug as PolicySlug;
  const pages = await getSettings("pages");

  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Policies">
        {(Object.keys(POLICY_PAGES) as PolicySlug[]).map((s) => (
          <Link
            key={s}
            href={`/policies/${s}`}
            className={cn("flex-shrink-0 rounded-sm px-3 py-2 text-sm", s === slug ? "bg-luxury-900 font-semibold text-white dark:bg-white dark:text-zinc-900" : "hover:bg-luxury-100 dark:hover:bg-zinc-800")}
          >
            {POLICY_PAGES[s]}
          </Link>
        ))}
      </nav>
      <article className="max-w-3xl">
        <h1 className="mb-8 font-serif text-4xl">{POLICY_PAGES[slug]}</h1>
        <div className="prose-store">
          {textBlocks(pages.policies[slug]).map((b, i) => (b.type === "h" ? <h2 key={i}>{b.text}</h2> : <p key={i}>{b.text}</p>))}
        </div>
      </article>
    </div>
  );
}
