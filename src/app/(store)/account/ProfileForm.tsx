"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage, FetchError } from "@/lib/fetcher";

export default function ProfileForm({ initial }: { initial: { name: string; phone: string; email: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFields({});
    try {
      await api("/api/account/profile", { method: "PATCH", body: { name, phone } });
      toast("Profile updated");
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid max-w-xl gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormError message={error} />
      </div>
      <Field label="Full name" htmlFor="p-name" error={fields.name}>
        <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </Field>
      <Field label="Mobile" htmlFor="p-phone" error={fields.phone}>
        <Input id="p-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Email" htmlFor="p-email" hint="Contact us to change your email address." className="sm:col-span-2">
        <Input id="p-email" value={initial.email} disabled />
      </Field>
      <div>
        <Button type="submit" loading={saving}>Save changes</Button>
      </div>
    </form>
  );
}
