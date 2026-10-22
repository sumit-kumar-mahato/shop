"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExternalLink, Eye, Loader2, Monitor, RotateCw, Smartphone, Tablet, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Form";
import type { PreviewState } from "@/components/admin/useSettingsForm";
import { cn } from "@/lib/utils";

const DEVICES = {
  desktop: { width: 1280, icon: Monitor, label: "Desktop" },
  tablet: { width: 820, icon: Tablet, label: "Tablet" },
  mobile: { width: 390, icon: Smartphone, label: "Phone" },
} as const;
type Device = keyof typeof DEVICES;

export type PreviewPath = { label: string; href: string };

/**
 * Layout for a website editor: the form on the left and, when switched on, a live preview of the
 * storefront on the right (full-screen on smaller screens). A sticky bar publishes or discards changes.
 */
export default function EditorShell({
  children,
  dirty,
  saving,
  error,
  onSave,
  onReset,
  preview,
  previewPaths,
}: {
  children: React.ReactNode;
  dirty: boolean;
  saving: boolean;
  error?: string | null;
  onSave: () => void;
  onReset: () => void;
  preview?: PreviewState;
  previewPaths?: PreviewPath[];
}) {
  const showPreview = Boolean(preview?.on && previewPaths?.length);
  return (
    <div>
      <FormError message={error} />
      <div className={cn("grid gap-6", showPreview && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]", error && "mt-4")}>
        <div className="min-w-0 space-y-5">{children}</div>
        {showPreview && preview && previewPaths && (
          <div className="fixed inset-0 z-50 flex flex-col bg-zinc-100 p-3 dark:bg-zinc-950 xl:sticky xl:inset-auto xl:top-20 xl:z-0 xl:h-[calc(100vh-7.5rem)] xl:rounded-xl xl:border xl:border-zinc-200 xl:bg-white xl:p-0 xl:dark:border-zinc-800 xl:dark:bg-zinc-900">
            <PreviewPane paths={previewPaths} preview={preview} />
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:-mx-6 sm:px-6">
        <span className="mr-auto flex items-center gap-2 text-sm">
          {dirty ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> <span className="text-amber-700 dark:text-amber-400">Unpublished changes</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500" /> <span className="text-zinc-500">All changes are live</span>
            </>
          )}
        </span>
        {preview && previewPaths?.length ? (
          <Button variant={preview.on ? "secondary" : "outline"} onClick={() => preview.setOn(!preview.on)}>
            <Eye size={16} /> {preview.on ? "Hide preview" : "Live preview"}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onReset} disabled={!dirty || saving}>
          Discard
        </Button>
        <Button onClick={onSave} loading={saving} disabled={!dirty}>
          Publish
        </Button>
      </div>
    </div>
  );
}

function PreviewPane({ paths, preview }: { paths: PreviewPath[]; preview: PreviewState }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [path, setPath] = useState(paths[0].href);
  const [loading, setLoading] = useState(true);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const frame = useRef<HTMLIFrameElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const lastPath = useRef(path);

  const src = `${path}${path.includes("?") ? "&" : "?"}pkm_preview=1&v=${preview.version}`;

  // Remember the scroll position across reloads of the same page so edits don't jump back to the top.
  useEffect(() => {
    try {
      scrollY.current = lastPath.current === path ? frame.current?.contentWindow?.scrollY ?? 0 : 0;
    } catch {
      scrollY.current = 0;
    }
    lastPath.current = path;
    setLoading(true);
  }, [src, path]);

  useLayoutEffect(() => {
    const el = holder.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const deviceWidth = DEVICES[device].width;
  const scale = box.w ? Math.min(1, box.w / deviceWidth) : 1;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <select value={path} onChange={(e) => setPath(e.target.value)} className="h-8 max-w-[45%] rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-700 dark:bg-zinc-950" aria-label="Page to preview">
          {paths.map((p) => (
            <option key={p.href} value={p.href}>{p.label}</option>
          ))}
        </select>
        <div className="flex rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800">
          {(Object.keys(DEVICES) as Device[]).map((d) => {
            const I = DEVICES[d].icon;
            return (
              <button key={d} type="button" onClick={() => setDevice(d)} className={cn("rounded p-1.5", device === d ? "bg-white shadow-sm dark:bg-zinc-950" : "text-zinc-500")} aria-label={DEVICES[d].label} aria-pressed={device === d}>
                <I size={14} />
              </button>
            );
          })}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          {preview.saving || loading ? <Loader2 size={12} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
          {preview.saving ? "Updating…" : loading ? "Loading…" : "Up to date"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => frame.current?.contentWindow?.location.reload()} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Reload preview">
            <RotateCw size={14} />
          </button>
          <a href={src} target="_blank" rel="noreferrer" className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Open preview in a new tab">
            <ExternalLink size={14} />
          </a>
          <button type="button" onClick={() => preview.setOn(false)} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close preview">
            <X size={14} />
          </button>
        </div>
      </div>
      {preview.error && <p className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">Preview not updated: {preview.error}</p>}
      <div ref={holder} className="relative flex-1 overflow-hidden bg-zinc-200/60 dark:bg-zinc-950">
        {box.w > 0 && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: deviceWidth * scale, height: box.h }}>
            <iframe
              ref={frame}
              src={src}
              title="Live preview"
              onLoad={() => {
                setLoading(false);
                try {
                  frame.current?.contentWindow?.scrollTo(0, scrollY.current);
                } catch {
                  // ignore
                }
              }}
              className="origin-top-left border-0 bg-white shadow-xl"
              style={{ width: deviceWidth, height: box.h / scale, transform: `scale(${scale})` }}
            />
          </div>
        )}
      </div>
      <p className="border-t border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-500 dark:border-zinc-800">Only you see this preview. Links inside it open the published site.</p>
    </>
  );
}
