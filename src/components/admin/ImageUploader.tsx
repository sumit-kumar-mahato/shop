"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

const MAX_DIMENSION = 1800;

/** Resize large photos in the browser before upload so pages stay fast. */
async function resizeImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 600_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (blob && blob.type === "image/webp") return blob;
  return (await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))) ?? file;
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await resizeImage(file);
  const form = new FormData();
  form.append("file", blob, file.name);
  const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

/** Manage a list of images: upload from computer, paste a link, reorder, remove. First image is the cover. */
export function ImageListEditor({ images, onChange, max = 12 }: { images: string[]; onChange: (images: string[]) => void; max?: number }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [url, setUrl] = useState("");

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, max - images.length);
    setUploading(list.length);
    const added: string[] = [];
    for (const f of list) {
      try {
        added.push(await uploadImage(f));
      } catch (err) {
        toast(`${f.name}: ${errorMessage(err)}`, "error");
      }
      setUploading((n) => n - 1);
    }
    onChange([...images, ...added]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addUrl = () => {
    const v = url.trim();
    if (!/^https:\/\//i.test(v)) return toast("Image links must start with https://", "error");
    onChange([...images, v]);
    setUrl("");
  };

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((img, i) => (
          <div key={img + i} className="group relative aspect-[3/4] overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
            <img src={img} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 text-white disabled:opacity-30" aria-label="Move left"><ArrowLeft size={14} /></button>
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="rounded p-1 text-white hover:text-red-400" aria-label="Remove image"><X size={14} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="rounded p-1 text-white disabled:opacity-30" aria-label="Move right"><ArrowRight size={14} /></button>
            </div>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void addFiles(e.dataTransfer.files);
            }}
            className={cn("flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-500 dark:border-zinc-700")}
          >
            {uploading > 0 ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
            {uploading > 0 ? `Uploading ${uploading}…` : "Upload / drop"}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image link (https://)"
            className="h-9 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button type="button" onClick={addUrl} disabled={!url.trim()} className="h-9 rounded-md border border-zinc-200 px-3 text-sm disabled:opacity-50 dark:border-zinc-700">
          Add link
        </button>
      </div>
      <p className="text-xs text-zinc-500">JPEG, PNG or WebP. Large photos are resized automatically. The first image is used as the cover.</p>
    </div>
  );
}

/** Single image field (for banners, categories, etc.). */
export function SingleImageField({ value, onChange, aspect = "aspect-video" }: { value: string; onChange: (v: string) => void; aspect?: string }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      onChange(await uploadImage(f));
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn("relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800", aspect)}>
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-zinc-400">No image</div>}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900 shadow">
            {busy ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />} {value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow">
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files)} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="or paste an image link (https://)" className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950" />
    </div>
  );
}
