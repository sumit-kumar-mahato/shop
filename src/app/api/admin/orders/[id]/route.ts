import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireStaff, route } from "@/lib/api";
import { orderUpdateSchema } from "@/lib/admin-schemas";
import { updateOrderByStaff } from "@/lib/orders";
import { audit } from "@/lib/audit";

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const input = await parseJson(req, orderUpdateSchema);
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) throw new ApiError(404, "Order not found.");

  if (input.status || input.courierName !== undefined || input.trackingNumber !== undefined || input.trackingUrl !== undefined || input.note) {
    await updateOrderByStaff(order.id, staff.name, input);
  }

  if (input.paymentStatus && input.paymentStatus !== order.paymentStatus) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: input.paymentStatus, ...(input.paymentStatus === "PAID" && !order.paidAt ? { paidAt: new Date() } : {}) },
      }),
      prisma.orderEvent.create({
        data: { orderId: order.id, status: order.status, note: `Payment marked as ${input.paymentStatus.toLowerCase()}.`, actor: staff.name },
      }),
    ]);
  }

  if (input.adminNote !== undefined) {
    await prisma.order.update({ where: { id: order.id }, data: { adminNote: input.adminNote || null } });
  }

  await audit(staff.id, "order.update", "Order", order.id, {
    orderNumber: order.orderNumber,
    ...(input.status ? { status: input.status } : {}),
    ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
  });
  const updated = await prisma.order.findUnique({ where: { id: order.id } });
  return ok({ order: updated });
});
