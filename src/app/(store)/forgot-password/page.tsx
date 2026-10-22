"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import AuthShell from "@/components/store/AuthShell";
import { api, errorMessage } from "@/lib/fetcher";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api("/api/auth/forgot-password", { body: { email } });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a secure link to choose a new password." footer={<Link href="/login" className="underline">Back to sign in</Link>}>
      {sent ? (
        <div className="space-y-3 text-center">
          <MailCheck size={40} className="mx-auto text-green-600" />
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-luxury-600 dark:text-zinc-400">
            If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link shortly. The link expires in 1 hour.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <FormError message={error} />
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </Field>
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
