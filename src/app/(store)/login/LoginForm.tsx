"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import AuthShell from "@/components/store/AuthShell";
import PasswordInput from "@/components/store/PasswordInput";
import { clearGuestCart, readGuestCart } from "@/components/providers/CartProvider";
import { api, errorMessage } from "@/lib/fetcher";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ user: { role: string } }>("/api/auth/login", { body: { email, password, guestCart: readGuestCart() } });
      clearGuestCart();
      const dest = next || (res.user.role === "CUSTOMER" ? "/account" : "/admin");
      // Full navigation so every part of the page picks up the new session.
      window.location.assign(dest);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to track orders, save your wishlist and check out faster."
      footer={
        <>
          New here?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-luxury-900 underline dark:text-white">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <FormError message={error} />
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </Field>
        <Field
          label={
            <span className="flex justify-between">
              Password
              <Link href="/forgot-password" className="normal-case tracking-normal text-luxury-600 underline-offset-2 hover:underline">
                Forgot password?
              </Link>
            </span>
          }
          htmlFor="password"
        >
          <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
