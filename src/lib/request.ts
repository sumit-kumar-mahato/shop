type HeaderSource = { get(name: string): string | null };

export function getClientIp(h: HeaderSource): string | null {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 64);
  return h.get("x-real-ip")?.slice(0, 64) ?? null;
}
