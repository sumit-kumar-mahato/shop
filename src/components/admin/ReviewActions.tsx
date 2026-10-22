"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";

export default function ReviewActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      toast(msg);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (s: string, msg: string) => run(() => api(`/api/admin/reviews/${id}`, { method: "PATCH", body: { status: s } }), msg);

  return (
    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
      {status !== "APPROVED" && (
        <Button size="sm" onClick={() => setStatus("APPROVED", "Review approved")} disabled={busy}>
          <Check size={14} /> Approve
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button size="sm" variant="outline" onClick={() => setStatus("REJECTED", "Review rejected")} disabled={busy}>
          <X size={14} /> Reject
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="text-red-600"
        disabled={busy}
        onClick={() => confirm("Delete this review permanently?") && run(() => api(`/api/admin/reviews/${id}`, { method: "DELETE" }), "Review deleted")}
      >
        <Trash2 size={14} /> Delete
      </Button>
    </div>
  );
}
