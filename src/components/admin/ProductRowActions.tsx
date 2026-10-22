"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";

export default function ProductRowActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const setStatus = async (next: string) => {
    setOpen(false);
    try {
      await api(`/api/admin/products/${id}`, { method: "PUT", body: { status: next } });
      toast(`Product ${next === "ACTIVE" ? "published" : next.toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const remove = async () => {
    setOpen(false);
    if (!confirm("Delete this product? If it has been ordered before, it will be archived instead so your order history stays intact.")) return;
    try {
      const res = await api<{ archived?: boolean }>(`/api/admin/products/${id}`, { method: "DELETE" });
      toast(res.archived ? "Product archived (it appears in past orders)" : "Product deleted");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((o) => !o)} className="rounded p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Actions">
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-zinc-200 bg-white py-1 text-left text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <Link href={`/admin/products/${id}`} className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"><Pencil size={14} /> Edit</Link>
            <Link href={`/product/${slug}`} target="_blank" className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"><Eye size={14} /> View on store</Link>
            {status !== "ACTIVE" && <button onClick={() => setStatus("ACTIVE")} className="block w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">Publish</button>}
            {status === "ACTIVE" && <button onClick={() => setStatus("DRAFT")} className="block w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">Unpublish (draft)</button>}
            {status !== "ARCHIVED" && <button onClick={() => setStatus("ARCHIVED")} className="block w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800">Archive</button>}
            <button onClick={remove} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={14} /> Delete</button>
          </div>
        </>
      )}
    </div>
  );
}
