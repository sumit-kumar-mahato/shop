"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/admin/ui";
import { ROLE_LABELS } from "@/lib/constants";
import { api, errorMessage } from "@/lib/fetcher";

export default function CustomerControls({ id, role, isActive, canManage }: { id: string; role: Role; isActive: boolean; canManage: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [nextRole, setNextRole] = useState<Role>(role);
  const [busy, setBusy] = useState(false);

  if (!canManage) return null;

  const update = async (body: { role?: Role; isActive?: boolean }, message: string) => {
    setBusy(true);
    try {
      await api(`/api/admin/customers/${id}`, { method: "PATCH", body });
      toast(message);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Account access" description="Administrator only">
      <div className="space-y-4">
        <Field label="Role" htmlFor="role" hint="Staff can manage orders, products and content. Administrators can also change store settings and roles.">
          <div className="flex gap-2">
            <Select id="role" value={nextRole} onChange={(e) => setNextRole(e.target.value as Role)}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
            <Button
              variant="secondary"
              disabled={nextRole === role}
              loading={busy}
              onClick={() => {
                if (confirm(`Change this account's role to ${ROLE_LABELS[nextRole]}? They will be signed out.`)) void update({ role: nextRole }, "Role updated");
              }}
            >
              Save
            </Button>
          </div>
        </Field>
        <Button
          variant={isActive ? "danger" : "secondary"}
          size="sm"
          loading={busy}
          onClick={() => {
            if (confirm(isActive ? "Disable this account? They will be signed out and unable to sign in." : "Re-enable this account?")) void update({ isActive: !isActive }, isActive ? "Account disabled" : "Account enabled");
          }}
        >
          {isActive ? "Disable account" : "Enable account"}
        </Button>
      </div>
    </Panel>
  );
}
