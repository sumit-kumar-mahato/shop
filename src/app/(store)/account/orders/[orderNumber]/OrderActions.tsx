"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Textarea } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/fetcher";
import { openRazorpay } from "@/lib/razorpay-client";

type PayResponse = {
  orderNumber: string;
  razorpay: { keyId: string; orderId: string; amount: number; currency: string };
  prefill: { name: string; email: string; contact: string };
};

export default function OrderActions({
  orderNumber,
  canCancel,
  canReturn,
  returnDeadline,
  canPay,
  storeName,
  brandColor,
}: {
  orderNumber: string;
  canCancel: boolean;
  canReturn: boolean;
  returnDeadline: string | null;
  canPay: boolean;
  storeName: string;
  brandColor: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [dialog, setDialog] = useState<"cancel" | "return" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canCancel && !canReturn && !canPay) return null;

  const pay = async () => {
    setBusy(true);
    try {
      const res = await api<PayResponse>(`/api/orders/${orderNumber}/pay`, { method: "POST", body: {} });
      const payment = await openRazorpay({ ...res.razorpay, storeName, description: `Order ${orderNumber}`, prefill: res.prefill, color: brandColor });
      if (payment) {
        await api("/api/payments/razorpay/verify", { body: { orderNumber, ...payment } });
        toast("Payment successful — your order is confirmed!");
        router.replace(`/account/orders/${orderNumber}?placed=1`);
        router.refresh();
      }
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/orders/${orderNumber}/${dialog}`, { body: { reason } });
      toast(dialog === "cancel" ? "Your order has been cancelled." : "Return requested — we'll be in touch shortly.");
      setDialog(null);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-luxury-200 pt-5 dark:border-zinc-800">
      {canPay && (
        <Button onClick={pay} loading={busy && !dialog}>
          Complete payment
        </Button>
      )}
      {canCancel && (
        <Button variant="outline" onClick={() => setDialog("cancel")}>
          Cancel order
        </Button>
      )}
      {canReturn && (
        <>
          <Button variant="outline" onClick={() => setDialog("return")}>
            Request a return
          </Button>
          <span className="text-xs text-luxury-500">Returns accepted until {returnDeadline}</span>
        </>
      )}

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog === "cancel" ? "Cancel this order?" : "Request a return"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialog(null)}>
              Keep order
            </Button>
            <Button variant={dialog === "cancel" ? "danger" : "primary"} onClick={submit} loading={busy} disabled={dialog === "return" && reason.trim().length < 5}>
              {dialog === "cancel" ? "Yes, cancel order" : "Submit request"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormError message={error} />
          <p className="text-sm text-luxury-600 dark:text-zinc-400">
            {dialog === "cancel"
              ? "If you paid online, your refund will be processed to the original payment method within 5–7 business days."
              : "Please tell us why you'd like to return this order. Items must be unused with tags attached."}
          </p>
          <Field label={dialog === "cancel" ? "Reason (optional)" : "Reason"} htmlFor="reason">
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
