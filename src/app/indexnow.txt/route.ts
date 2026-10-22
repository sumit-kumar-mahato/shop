import { INDEXNOW_KEY } from "@/lib/indexnow";

/** IndexNow ownership file — search engines fetch it to confirm our URL submissions. */
export function GET() {
  return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
