"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Select } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { Panel, Table, Td, Th } from "@/components/admin/ui";
import { api, errorMessage, FetchError } from "@/lib/fetcher";
import { formatINR, toPaise } from "@/lib/money";
import { formatDate } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number | null;
  isActive: boolean;
  isPublic: boolean;
};

type FormState = {
  id?: string;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscount: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  isActive: boolean;
  isPublic: boolean;
};

const toLocalInput = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const blank: FormState = { code: "", description: "", type: "PERCENTAGE", value: "10", minOrderAmount: "0", maxDiscount: "", startsAt: "", expiresAt: "", usageLimit: "", perUserLimit: "1", isActive: true, isPublic: true };

function status(c: Coupon): { label: string; tone: "green" | "neutral" | "red" | "amber" } {
  const now = Date.now();
  if (!c.isActive) return { label: "Inactive", tone: "neutral" };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return { label: "Expired", tone: "red" };
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: "Scheduled", tone: "amber" };
  if (c.usageLimit != null && c.usageCount >= c.usageLimit) return { label: "Used up", tone: "red" };
  return { label: "Active", tone: "green" };
}

export default function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const edit = (c: Coupon) =>
    setForm({
      id: c.id,
      code: c.code,
      description: c.description ?? "",
      type: c.type,
      value: c.type === "PERCENTAGE" ? String(c.value) : String(c.value / 100),
      minOrderAmount: String(c.minOrderAmount / 100),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount / 100) : "",
      startsAt: toLocalInput(c.startsAt),
      expiresAt: toLocalInput(c.expiresAt),
      usageLimit: c.usageLimit ? String(c.usageLimit) : "",
      perUserLimit: c.perUserLimit ? String(c.perUserLimit) : "",
      isActive: c.isActive,
      isPublic: c.isPublic,
    });

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    setFields({});
    const body = {
      code: form.code,
      description: form.description || null,
      type: form.type,
      value: form.type === "PERCENTAGE" ? parseInt(form.value, 10) || 0 : toPaise(form.value),
      minOrderAmount: toPaise(form.minOrderAmount || "0"),
      maxDiscount: form.maxDiscount ? toPaise(form.maxDiscount) : null,
      startsAt: fromLocalInput(form.startsAt),
      expiresAt: fromLocalInput(form.expiresAt),
      usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
      perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : null,
      isActive: form.isActive,
      isPublic: form.isPublic,
    };
    try {
      if (form.id) await api(`/api/admin/coupons/${form.id}`, { method: "PATCH", body });
      else await api("/api/admin/coupons", { body });
      toast("Coupon saved");
      setForm(null);
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setFields(err.fields);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      const res = await api<{ deactivated: boolean }>(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      toast(res.deactivated ? "Coupon deactivated (it was used in orders)" : "Coupon deleted");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  return (
    <>
      <Panel
        padded={false}
        title={`${initial.length} coupons`}
        actions={
          <Button size="sm" onClick={() => setForm({ ...blank })}>
            <Plus size={16} /> New coupon
          </Button>
        }
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th>Status</Th>
              <Th>Valid</Th>
              <Th>Used</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {initial.map((c) => {
              const s = status(c);
              return (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td>
                    <p className="font-mono font-semibold">{c.code}</p>
                    {c.isPublic && <p className="text-xs text-zinc-500">Shown on Offers page</p>}
                  </Td>
                  <Td>
                    {c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                    {c.minOrderAmount > 0 && <p className="text-xs text-zinc-500">Min. order {formatINR(c.minOrderAmount)}</p>}
                  </Td>
                  <Td><Badge tone={s.tone}>{s.label}</Badge></Td>
                  <Td className="text-zinc-500">{c.expiresAt ? `Until ${formatDate(c.expiresAt)}` : "No expiry"}</Td>
                  <Td className="tabular-nums">{c.usageCount}{c.usageLimit != null && ` / ${c.usageLimit}`}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <button onClick={() => edit(c)} className="rounded p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label={`Edit ${c.code}`}><Pencil size={16} /></button>
                    <button onClick={() => remove(c)} className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={`Delete ${c.code}`}><Trash2 size={16} /></button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {initial.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No coupons yet.</p>}
      </Panel>

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "Edit coupon" : "New coupon"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save coupon</Button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <FormError message={error} />
            <Field label="Code" htmlFor="cp-code" error={fields.code}>
              <Input id="cp-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })} className="font-mono uppercase" placeholder="FESTIVE10" />
            </Field>
            <Field label="Description (optional)" htmlFor="cp-desc" hint="Shown on the Offers page">
              <Input id="cp-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type" htmlFor="cp-type">
                <Select id="cp-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FormState["type"] })}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount (₹)</option>
                </Select>
              </Field>
              <Field label={form.type === "PERCENTAGE" ? "Percent off" : "Amount off (₹)"} htmlFor="cp-val" error={fields.value}>
                <Input id="cp-val" type="number" min={1} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
              </Field>
              <Field label="Minimum order (₹)" htmlFor="cp-min">
                <Input id="cp-min" type="number" min={0} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
              </Field>
              {form.type === "PERCENTAGE" && (
                <Field label="Max discount (₹)" htmlFor="cp-max" hint="Optional cap">
                  <Input id="cp-max" type="number" min={0} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
                </Field>
              )}
              <Field label="Starts (optional)" htmlFor="cp-start">
                <Input id="cp-start" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
              </Field>
              <Field label="Expires (optional)" htmlFor="cp-exp" error={fields.expiresAt}>
                <Input id="cp-exp" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </Field>
              <Field label="Total uses allowed" htmlFor="cp-limit" hint="Blank = unlimited">
                <Input id="cp-limit" type="number" min={1} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />
              </Field>
              <Field label="Uses per customer" htmlFor="cp-peruser" hint="Blank = unlimited">
                <Input id="cp-peruser" type="number" min={1} value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} />
              </Field>
            </div>
            <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <Checkbox label="Show on the public Offers page" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
          </div>
        )}
      </Modal>
    </>
  );
}
