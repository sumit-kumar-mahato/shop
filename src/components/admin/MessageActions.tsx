"use client";

import { useRouter } from "next/navigation";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";

export default function MessageActions({ id, isRead, email, subject }: { id: string; isRead: boolean; email: string; subject: string }) {
  const router = useRouter();
  const toast = useToast();

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  const btn = "rounded p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white";
  return (
    <div className="flex">
      <a href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`} className={btn} aria-label="Reply by email" onClick={() => !isRead && run(() => api(`/api/admin/messages/${id}`, { method: "PATCH", body: { isRead: true } }))}>
        <Reply size={16} />
      </a>
      <button className={btn} onClick={() => run(() => api(`/api/admin/messages/${id}`, { method: "PATCH", body: { isRead: !isRead } }))} aria-label={isRead ? "Mark as unread" : "Mark as read"}>
        {isRead ? <Mail size={16} /> : <MailOpen size={16} />}
      </button>
      <button className={`${btn} hover:text-red-600`} onClick={() => confirm("Delete this message?") && run(() => api(`/api/admin/messages/${id}`, { method: "DELETE" }))} aria-label="Delete message">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
