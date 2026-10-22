"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import AddressForm, { type AddressData } from "@/components/store/AddressForm";
import { Button } from "@/components/ui/Button";
import { Badge, Card, EmptyState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";

export default function AddressBook({ initial, defaultName, defaultPhone }: { initial: AddressData[]; defaultName: string; defaultPhone: string | null }) {
  const toast = useToast();
  const [addresses, setAddresses] = useState(initial);
  const [editing, setEditing] = useState<AddressData | "new" | null>(null);

  const reload = async () => {
    const res = await api<{ addresses: AddressData[] }>("/api/account/addresses");
    setAddresses(res.addresses);
  };

  const remove = async (a: AddressData) => {
    if (!confirm("Delete this address?")) return;
    try {
      await api(`/api/account/addresses/${a.id}`, { method: "DELETE" });
      await reload();
      toast("Address deleted");
    } catch (err) {
      toast(errorMessage(err), "error");
    }
  };

  if (editing) {
    return (
      <Card className="p-6">
        <h2 className="mb-5 font-serif text-xl">{editing === "new" ? "Add address" : "Edit address"}</h2>
        <AddressForm
          initial={editing === "new" ? null : editing}
          defaultName={defaultName}
          defaultPhone={defaultPhone}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            await reload();
            setEditing(null);
            toast("Address saved");
          }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Addresses</h2>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={16} /> Add address
        </Button>
      </div>
      {addresses.length === 0 ? (
        <EmptyState icon={<MapPin size={40} />} title="No saved addresses" description="Save an address for faster checkout." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className="flex flex-col p-5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{a.fullName}</p>
                {a.isDefault && <Badge>Default</Badge>}
              </div>
              <p className="mt-2 flex-1 text-luxury-600 dark:text-zinc-400">
                {[a.line1, a.line2, a.landmark].filter(Boolean).join(", ")}
                <br />
                {a.city}, {a.state} – {a.postalCode}
                <br />
                {a.phone}
              </p>
              <div className="mt-4 flex gap-4">
                <button onClick={() => setEditing(a)} className="flex items-center gap-1 font-medium hover:underline">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => remove(a)} className="flex items-center gap-1 font-medium text-red-600 hover:underline">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
