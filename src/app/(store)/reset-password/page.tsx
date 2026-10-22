"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, FormError } from "@/components/ui/Form";
import AuthShell from "@/components/store/AuthShell";
import PasswordInput, { StrengthMeter } from "@/components/store/PasswordInput";
import { api, errorMessage } from "@/lib/fetcher";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/reset-password", { body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is missing or incomplete.">
        <LinkButton href="/forgot-password" fullWidth>Request a new link</LinkButton>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" footer={<Link href="/login" className="underline">Back to sign in</Link>}>
      {done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 size={40} className="mx-auto text-green-600" />
          <p className="font-semibold">Your password has been updated</p>
          <p className="text-sm text-luxury-600 dark:text-zinc-400">For your security we signed you out of all devices.</p>
          <LinkButton href="/login" fullWidth>Sign in</LinkButton>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <FormError message={error} />
          <Field label="New password" htmlFor="pw" hint="At least 8 characters, with a letter and a number.">
            <PasswordInput id="pw" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoFocus />
            <StrengthMeter password={password} />
          </Field>
          <Field label="Confirm password" htmlFor="pw2">
            <PasswordInput id="pw2" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Field>
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
