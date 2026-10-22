"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";
import type { SettingKey } from "@/lib/settings-schema";

/**
 * Shared state for the settings editors: dirty tracking, save, discard, leave-page warning,
 * and — while the live preview is open — automatic draft saves so the preview shows unsaved changes.
 */
export function useSettingsForm<T>(key: SettingKey, initial: T) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  // Live preview
  const [previewOn, setPreviewOn] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const lastDraft = useRef<string>("");

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (!previewOn) return;
    const json = JSON.stringify(value);
    if (json === lastDraft.current) return;
    const t = setTimeout(async () => {
      setDraftSaving(true);
      try {
        await api(`/api/admin/settings/${key}?draft=1`, { method: "PUT", body: value });
        lastDraft.current = json;
        setDraftError(null);
        setPreviewVersion((v) => v + 1);
      } catch (err) {
        setDraftError(errorMessage(err));
      } finally {
        setDraftSaving(false);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [previewOn, value, key]);

  const save = async (transform?: (v: T) => unknown) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api<{ settings: T }>(`/api/admin/settings/${key}`, { method: "PUT", body: transform ? transform(value) : value });
      setSaved(value);
      lastDraft.current = "";
      toast("Published — your website is updated");
      setPreviewVersion((v) => v + 1);
      router.refresh();
      return res.settings;
    } catch (err) {
      setError(errorMessage(err));
      toast(errorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    value,
    setValue,
    dirty,
    saving,
    error,
    save,
    reset: () => setValue(saved),
    preview: { on: previewOn, setOn: setPreviewOn, version: previewVersion, error: draftError, saving: draftSaving },
  };
}

export type PreviewState = ReturnType<typeof useSettingsForm>["preview"];
