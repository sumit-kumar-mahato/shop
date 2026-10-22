import type { Banner } from "@/lib/settings-schema";

/** Hero slides that are live right now (slides can be scheduled with optional start/end times). */
export function activeBanners(banners: Banner[], now = Date.now()): Banner[] {
  return banners.filter((b) => {
    const start = b.startsAt ? new Date(b.startsAt).getTime() : NaN;
    const end = b.endsAt ? new Date(b.endsAt).getTime() : NaN;
    return !(start > now) && !(end <= now);
  });
}

/** YouTube video id from a watch, share, shorts or embed link. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
