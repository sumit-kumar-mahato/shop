"use client";

import { useState } from "react";
import type { Address } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Select } from "@/components/ui/Form";
import { api, errorMessage, FetchError } from "@/lib/fetcher";
import { INDIAN_STATES } from "@/lib/validators";

export type AddressData = Omit<Address, "createdAt" | "updatedAt" | "userId"> & { createdAt: string; updatedAt: string; userId?: string };

const empty = { fullName: "", phone: "", line1: "", line2: "", landmark: "", city: "", state: "", postalCode: "", isDefault: false };

export default function AddressForm({
  initial,
  defaultName,
  defaultPhone,
  onSaved,
  onCancel,
}: {
  initial?: AddressData | null;
  defaultName?: string;
  defaultPhone?: string | null;
  onSaved: (address: AddressData) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState(() =>
    initial
      ? { ...empty, ...initial, line2: initial.line2 ?? "", landmark: initial.landmark ?? "" }
      : { ...empty, fullName: defaultName ?? "", phone: defaultPhone ?? "" },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrors({});
    try {
      const body = {
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        isDefault: form.isDefault,
      };
      const res = initial
        ? await api<{ address: AddressData }>(`/api/account/addresses/${initial.id}`, { method: "PATCH", body })
        : await api<{ address: AddressData }>("/api/account/addresses", { body });
      onSaved(res.address);
    } catch (err) {
      if (err instanceof FetchError && err.fields) setErrors(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="a-name" error={errors.fullName}>
          <Input id="a-name" value={form.fullName} onChange={set("fullName")} autoComplete="name" required invalid={!!errors.fullName} />
        </Field>
        <Field label="Mobile number" htmlFor="a-phone" error={errors.phone} hint="For delivery updates">
          <Input id="a-phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" required invalid={!!errors.phone} />
        </Field>
        <Field label="House / flat, street" htmlFor="a-line1" error={errors.line1} className="sm:col-span-2">
          <Input id="a-line1" value={form.line1} onChange={set("line1")} autoComplete="address-line1" required invalid={!!errors.line1} />
        </Field>
        <Field label="Area / locality (optional)" htmlFor="a-line2" error={errors.line2}>
          <Input id="a-line2" value={form.line2} onChange={set("line2")} autoComplete="address-line2" />
        </Field>
        <Field label="Landmark (optional)" htmlFor="a-landmark" error={errors.landmark}>
          <Input id="a-landmark" value={form.landmark} onChange={set("landmark")} />
        </Field>
        <Field label="City" htmlFor="a-city" error={errors.city}>
          <Input id="a-city" value={form.city} onChange={set("city")} autoComplete="address-level2" required invalid={!!errors.city} />
        </Field>
        <Field label="PIN code" htmlFor="a-pin" error={errors.postalCode}>
          <Input id="a-pin" value={form.postalCode} onChange={set("postalCode")} autoComplete="postal-code" inputMode="numeric" maxLength={6} required invalid={!!errors.postalCode} />
        </Field>
        <Field label="State" htmlFor="a-state" error={errors.state} className="sm:col-span-2">
          <Select id="a-state" value={form.state} onChange={set("state")} autoComplete="address-level1" required invalid={!!errors.state}>
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Checkbox label="Make this my default address" checked={form.isDefault} onChange={set("isDefault")} />
      <div className="flex gap-2">
        <Button type="submit" loading={saving}>{initial ? "Save address" : "Save & use this address"}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
