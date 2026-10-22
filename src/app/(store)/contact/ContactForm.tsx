"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Input, Textarea } from "@/components/ui/Form";
import { api, errorMessage, FetchError } from "@/lib/fetcher";

export default function ContactForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [form, setForm] = useState({ name: defaultName, email: defaultEmail, phone: "", subject: "", message: "", website: "" });
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setFields({});
    try {
      await api("/api/contact", { body: { ...form, phone: form.phone || undefined } });
      setSent(true);
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 size={44} className="mx-auto text-green-600" />
        <p className="mt-4 font-serif text-2xl">Message sent</p>
        <p className="mt-2 text-sm text-luxury-600 dark:text-zinc-400">Thank you, {form.name.split(" ")[0]}. We usually reply within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <FormError message={error} />
      </div>
      <Field label="Name" htmlFor="c-name" error={fields.name}>
        <Input id="c-name" value={form.name} onChange={set("name")} required autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="c-email" error={fields.email}>
        <Input id="c-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
      </Field>
      <Field label="Phone (optional)" htmlFor="c-phone">
        <Input id="c-phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
      </Field>
      <Field label="Subject" htmlFor="c-subject" error={fields.subject}>
        <Input id="c-subject" value={form.subject} onChange={set("subject")} required minLength={3} />
      </Field>
      <Field label="Message" htmlFor="c-message" error={fields.message} className="sm:col-span-2">
        <Textarea id="c-message" value={form.message} onChange={set("message")} rows={6} required minLength={10} maxLength={3000} />
      </Field>
      {/* Honeypot field — hidden from people, catches bots */}
      <input type="text" name="website" value={form.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div>
        <Button type="submit" loading={sending}>Send message</Button>
      </div>
    </form>
  );
}
