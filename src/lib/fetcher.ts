// Small client-side helper for calling the JSON API.

export class FetchError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, opts: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: "same-origin",
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    const d = data as { error?: string; fields?: Record<string, string> } | null;
    throw new FetchError(res.status, d?.error || `Request failed (${res.status})`, d?.fields);
  }
  return data as T;
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof FetchError) return err.message;
  if (err instanceof Error && err.name !== "AbortError") return err.message || fallback;
  return fallback;
}
