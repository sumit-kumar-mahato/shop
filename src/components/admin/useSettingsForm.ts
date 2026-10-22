"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";

/** Shared state for the settings editors: dirty tracking, save, discard, and leave-page warning. */
export function useSettingsForm<T>(key: "store" | "homepage" | "pages", initial: T) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (transform?: (v: T) => unknown) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api<{ settings: T }>(`/api/admin/settings/${key}`, { method: "PUT", body: transform ? transform(value) : value });
      setSaved(value);
      toast("Changes saved — your website is updated");
      router.refresh();
      return res.settings;
    } catch (err) {
      setError(errorMessage(err));
      toast(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return { value, setValue, dirty, saving, error, save, reset: () => setValue(saved) };
}
