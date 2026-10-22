import "server-only";
import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export function buildOrderWhere(params: { q?: string; status?: string; payment?: string }): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};
  const q = params.q?.trim().slice(0, 80);
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { shippingName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
    ];
  }
  if (params.status && params.status in ORDER_STATUS_LABELS) where.status = params.status as OrderStatus;
  if (params.payment && ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(params.payment)) where.paymentStatus = params.payment as PaymentStatus;
  return where;
}
