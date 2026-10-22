"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input } from "@/components/ui/Form";
import AuthShell from "@/components/store/AuthShell";
import PasswordInput, { StrengthMeter } from "@/components/store/PasswordInput";
import { clearGuestCart, readGuestCart } from "@/components/providers/CartProvider";
import { api, errorMessage, FetchError } from "@/lib/fetcher";

export default function RegisterForm({ next }: { next: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", newsletter: true });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFields({});
    setLoading(true);
    try {
      await api("/api/auth/register", { body: { ...form, phone: form.phone || undefined, guestCart: readGuestCart() } });
      clearGuestCart();
      window.location.assign(next || "/account?welcome=1");
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Faster checkout, order tracking and member-only offers."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-luxury-900 underline dark:text-white">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <FormError message={error} />
        <Field label="Full name" htmlFor="name" error={fields.name}>
          <Input id="name" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} invalid={!!fields.name} />
        </Field>
        <Field label="Email" htmlFor="email" error={fields.email}>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required invalid={!!fields.email} />
        </Field>
        <Field label="Mobile (optional)" htmlFor="phone" error={fields.phone}>
          <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="Password" htmlFor="password" error={fields.password} hint="At least 8 characters, with a letter and a number.">
          <PasswordInput id="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} invalid={!!fields.password} />
          <StrengthMeter password={form.password} />
        </Field>
        <Checkbox label="Send me new arrivals and exclusive offers" checked={form.newsletter} onChange={(e) => setForm({ ...form, newsletter: e.target.checked })} />
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create account
        </Button>
        <p className="text-center text-xs text-luxury-500">
          By creating an account you agree to our <Link href="/policies/terms" className="underline">Terms</Link> and{" "}
          <Link href="/policies/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
