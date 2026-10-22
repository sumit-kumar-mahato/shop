"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";

/** Click-to-play YouTube player: shows a cover image and only loads YouTube when the visitor presses play. */
export default function VideoEmbed({ videoId, cover, title }: { videoId: string; cover: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const poster = cover || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title || "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  return (
    <button onClick={() => setPlaying(true)} className="group absolute inset-0 block h-full w-full" aria-label={`Play video${title ? `: ${title}` : ""}`}>
      <SmartImage src={poster} alt="" className="absolute inset-0" imgClassName="transition-transform duration-[1.2s] group-hover:scale-105" />
      <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
      <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-zinc-950 shadow-2xl transition-transform duration-500 group-hover:scale-110">
        <Play size={28} className="ml-1" fill="currentColor" />
        <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.4s]" aria-hidden />
      </span>
    </button>
  );
}
