import "server-only";
import { env } from "@/lib/env";

// IndexNow tells Bing, Yahoo, DuckDuckGo, Yandex and others about new or changed pages within minutes
// (Google ignores it and reads the sitemap instead). The key is public by design: search engines check
// that it is served at KEY_PATH on this site to confirm the request came from the site owner.
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "f2c75cf133baf0faecdfaa5983002c85";
export const KEY_PATH = "/indexnow.txt";

/** Best-effort: notify search engines about changed URLs. Never throws. */
export async function submitToIndexNow(paths: string[]): Promise<{ submitted: number; status?: number }> {
  const base = env.appUrl;
  if (!/^https:\/\//.test(base) || paths.length === 0) return { submitted: 0 };
  const urlList = [...new Set(paths.map((p) => (p.startsWith("http") ? p : `${base}${p}`)))].slice(0, 10_000);
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: new URL(base).host, key: INDEXNOW_KEY, keyLocation: `${base}${KEY_PATH}`, urlList }),
      signal: AbortSignal.timeout(10_000),
    });
    return { submitted: res.ok ? urlList.length : 0, status: res.status };
  } catch (err) {
    console.warn("[indexnow] submission failed", err);
    return { submitted: 0 };
  }
}
