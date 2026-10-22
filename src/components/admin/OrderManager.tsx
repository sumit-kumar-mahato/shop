"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, FormError, Input, Select, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/admin/ui";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { api, errorMessage } from "@/lib/fetcher";

type Props = {
  order: {
    id: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
    adminNote: string;
  };
  transitions: OrderStatus[];
};

export default function OrderManager({ order, transitions }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [courierName, setCourier] = useState(order.courierName);
  const [trackingNumber, setTracking] = useState(order.trackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl);
  const [notify, setNotify] = useState(true);
  const [restock, setRestock] = useState(true);
  const [adminNote, setAdminNote] = useState(order.adminNote);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patch = async (key: string, body: Record<string, unknown>, success: string) => {
    setBusy(key);
    setError(null);
    try {
      await api(`/api/admin/orders/${order.id}`, { method: "PATCH", body });
      toast(success);
      setStatus("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const updateStatus = () => {
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock will be returned and any coupon released.")) return;
    void patch(
      "status",
      { status: status || undefined, note: note || null, courierName, trackingNumber, trackingUrl, notifyCustomer: notify, restockOnReturn: restock },
      status ? `Order marked as ${ORDER_STATUS_LABELS[status].toLowerCase()}` : "Shipping details saved",
    );
  };

  const shipping = status === "SHIPPED" || status === "OUT_FOR_DELIVERY" || order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY";

  return (
    <Panel title="Manage order">
      <div className="space-y-5">
        <FormError message={error} />
        {transitions.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Change status to" htmlFor="o-status">
              <Select id="o-status" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | "")}>
                <option value="">— Keep “{ORDER_STATUS_LABELS[order.status]}” —</option>
                {transitions.map((t) => (
                  <option key={t} value={t}>{ORDER_STATUS_LABELS[t]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Note (optional)" htmlFor="o-note" hint={notify ? "Included in the customer email" : undefined}>
              <Input id="o-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
            </Field>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">This order is {ORDER_STATUS_LABELS[order.status].toLowerCase()} — no further status changes are possible.</p>
        )}

        {(shipping || order.status === "CONFIRMED" || order.status === "PROCESSING") && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Courier" htmlFor="o-courier">
              <Input id="o-courier" value={courierName} onChange={(e) => setCourier(e.target.value)} placeholder="e.g. Delhivery" />
            </Field>
            <Field label="Tracking number" htmlFor="o-track">
              <Input id="o-track" value={trackingNumber} onChange={(e) => setTracking(e.target.value)} />
            </Field>
            <Field label="Tracking link" htmlFor="o-turl">
              <Input id="o-turl" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://" />
            </Field>
          </div>
        )}

        {status === "RETURNED" && <Checkbox label="Add the returned items back to stock" checked={restock} onChange={(e) => setRestock(e.target.checked)} />}
        <Checkbox label="Email the customer about this update" checked={notify} onChange={(e) => setNotify(e.target.checked)} />

        <Button onClick={updateStatus} loading={busy === "status"} variant={status === "CANCELLED" ? "danger" : "primary"}>
          {status ? `Mark as ${ORDER_STATUS_LABELS[status]}` : "Save shipping details"}
        </Button>

        <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <p className="mb-2 text-sm font-medium">Payment status</p>
          <div className="flex flex-wrap gap-2">
            {(["PENDING", "PAID", "REFUNDED"] as PaymentStatus[])
              .filter((s) => s !== order.paymentStatus)
              .map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  loading={busy === `pay-${s}`}
                  onClick={() => {
                    if (confirm(`Mark payment as ${PAYMENT_STATUS_LABELS[s]}?`)) void patch(`pay-${s}`, { paymentStatus: s }, `Payment marked as ${PAYMENT_STATUS_LABELS[s].toLowerCase()}`);
                  }}
                >
                  Mark {PAYMENT_STATUS_LABELS[s].toLowerCase()}
                </Button>
              ))}
          </div>
          {order.paymentMethod === "RAZORPAY" && <p className="mt-2 text-xs text-zinc-500">Refunds for online payments are issued from your Razorpay dashboard; then mark the payment as refunded here.</p>}
        </div>

        <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Field label="Internal note (only visible to staff)" htmlFor="o-admin">
            <Textarea id="o-admin" rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} maxLength={2000} />
          </Field>
          <Button size="sm" variant="secondary" className="mt-2" loading={busy === "note"} onClick={() => patch("note", { adminNote }, "Note saved")}>
            Save note
          </Button>
        </div>
      </div>
    </Panel>
  );
}
