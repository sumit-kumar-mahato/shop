"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Form";
import { Card } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import PasswordInput, { StrengthMeter } from "@/components/store/PasswordInput";
import { api, errorMessage, FetchError } from "@/lib/fetcher";

export default function SecurityForms({ otherSessions }: { otherSessions: number }) {
  const router = useRouter();
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFields({});
    if (next !== confirm) return setFields({ confirm: "Passwords don't match" });
    setSaving(true);
    try {
      await api("/api/account/password", { body: { currentPassword: current, newPassword: next } });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("Password changed. Other devices have been signed out.");
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const signOutOthers = async () => {
    setSigningOut(true);
    try {
      await api("/api/account/sessions", { method: "DELETE" });
      toast("Signed out of all other devices");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="mb-5 font-serif text-xl">Change password</h2>
        <form onSubmit={changePassword} className="max-w-md space-y-4">
          <FormError message={error} />
          <Field label="Current password" htmlFor="cur" error={fields.currentPassword}>
            <PasswordInput id="cur" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </Field>
          <Field label="New password" htmlFor="new" error={fields.newPassword} hint="At least 8 characters, with a letter and a number.">
            <PasswordInput id="new" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
            <StrengthMeter password={next} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm" error={fields.confirm}>
            <PasswordInput id="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Field>
          <Button type="submit" loading={saving}>Update password</Button>
        </form>
      </Card>

      {otherSessions > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="font-serif text-xl">Other devices</h2>
            <p className="text-sm text-luxury-500">You are signed in on {otherSessions} other {otherSessions === 1 ? "device" : "devices"}.</p>
          </div>
          <Button variant="outline" onClick={signOutOthers} loading={signingOut}>
            Sign out other devices
          </Button>
        </Card>
      )}
    </>
  );
}
