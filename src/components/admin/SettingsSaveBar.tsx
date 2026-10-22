"use client";

import { Button } from "@/components/ui/Button";

export default function SettingsSaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:-mx-6 sm:px-6">
      {dirty && <span className="mr-auto text-sm text-amber-600">You have unsaved changes</span>}
      <Button variant="ghost" onClick={onReset} disabled={!dirty || saving}>
        Discard
      </Button>
      <Button onClick={onSave} loading={saving} disabled={!dirty}>
        Save changes
      </Button>
    </div>
  );
}
