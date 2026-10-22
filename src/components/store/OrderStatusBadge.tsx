import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/Misc";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

const ORDER_TONE: Record<OrderStatus, Parameters<typeof Badge>[0]["tone"]> = {
  PENDING_PAYMENT: "amber",
  CONFIRMED: "blue",
  PROCESSING: "blue",
  SHIPPED: "purple",
  OUT_FOR_DELIVERY: "purple",
  DELIVERED: "green",
  CANCELLED: "red",
  RETURN_REQUESTED: "amber",
  RETURNED: "neutral",
};

const PAYMENT_TONE: Record<PaymentStatus, Parameters<typeof Badge>[0]["tone"]> = {
  PENDING: "amber",
  PAID: "green",
  FAILED: "red",
  REFUNDED: "neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_TONE[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
