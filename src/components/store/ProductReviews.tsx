"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Textarea } from "@/components/ui/Form";
import { Stars } from "@/components/ui/Misc";
import { api, errorMessage } from "@/lib/fetcher";
import { cn, formatDate } from "@/lib/utils";

type Review = { id: string; rating: number; title: string | null; comment: string; author: string; verified: boolean; createdAt: string };

export default function ProductReviews({
  productId,
  ratingAvg,
  ratingCount,
  distribution,
  reviews,
  signedIn,
  myReviewStatus,
}: {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
  distribution: Array<{ star: number; count: number }>;
  reviews: Review[];
  signedIn: boolean;
  myReviewStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
}) {
  const pathname = usePathname();
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">(myReviewStatus ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setState("saving");
    try {
      await api("/api/reviews", { body: { productId, rating, title: title || undefined, comment } });
      setState("done");
    } catch (err) {
      setError(errorMessage(err));
      setState("idle");
    }
  };

  const max = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <section id="reviews" className="mt-20 scroll-mt-24 border-t border-luxury-200 pt-14 dark:border-zinc-800">
      <h2 className="mb-8 font-serif text-3xl">Customer Reviews</h2>
      <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-serif text-5xl">{ratingCount ? ratingAvg.toFixed(1) : "—"}</span>
            <div>
              <Stars rating={ratingAvg} size={18} />
              <p className="mt-1 text-sm text-luxury-500">{ratingCount ? `Based on ${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}` : "No reviews yet"}</p>
            </div>
          </div>
          {ratingCount > 0 && (
            <ul className="space-y-1.5">
              {distribution.map((d) => (
                <li key={d.star} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-luxury-600">{d.star} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-luxury-200 dark:bg-zinc-800">
                    <span className="block h-full bg-amber-500" style={{ width: `${(d.count / max) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right text-luxury-500">{d.count}</span>
                </li>
              ))}
            </ul>
          )}

          {state === "done" ? (
            <p className="rounded-sm bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950/40 dark:text-green-300">
              {myReviewStatus === "APPROVED" ? "Thanks — your review is published." : "Thank you! Your review has been submitted and will appear once approved."}
            </p>
          ) : !signedIn ? (
            <p className="text-sm text-luxury-600 dark:text-zinc-400">
              <Link href={`/login?next=${encodeURIComponent(pathname + "#reviews")}`} className="font-semibold underline">Sign in</Link> to write a review.
            </p>
          ) : !formOpen ? (
            <Button variant="outline" onClick={() => setFormOpen(true)}>Write a review</Button>
          ) : (
            <form onSubmit={submit} className="space-y-4 rounded-sm border border-luxury-200 p-5 dark:border-zinc-800">
              <FormError message={error} />
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-luxury-600">Your rating</p>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHover(n)}
                      onClick={() => setRating(n)}
                      className="text-amber-500"
                    >
                      <Star size={26} fill={(hover || rating) >= n ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Headline (optional)" htmlFor="rv-title">
                <Input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
              </Field>
              <Field label="Your review" htmlFor="rv-comment">
                <Textarea id="rv-comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} minLength={10} maxLength={2000} required placeholder="How was the fabric, fit and quality?" />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" loading={state === "saving"}>Submit review</Button>
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </div>

        <div>
          {reviews.length === 0 ? (
            <p className="py-6 text-sm text-luxury-500">Be the first to review this product.</p>
          ) : (
            <ul className="divide-y divide-luxury-200 dark:divide-zinc-800">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars rating={r.rating} />
                    {r.title && <p className="font-semibold">{r.title}</p>}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-luxury-700 dark:text-zinc-300">{r.comment}</p>
                  <p className={cn("mt-3 flex items-center gap-2 text-xs text-luxury-500")}>
                    <span className="font-medium text-luxury-800 dark:text-zinc-200">{r.author}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400">
                        <BadgeCheck size={14} /> Verified purchase
                      </span>
                    )}
                    · {formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
