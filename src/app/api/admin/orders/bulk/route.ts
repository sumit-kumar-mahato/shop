import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { updateOrderByStaff } from "@/lib/orders";
import { audit } from "@/lib/audit";

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: z.enum(["PROCESSING", "DELIVERED"]),
  notifyCustomer: z.boolean().default(false),
});

/**
 * Move several orders to the next step at once (e.g. "packing" for all new orders).
 * Each order goes through the normal transition rules; orders that can't move are skipped.
 */
export const POST = route(async (req) => {
  const staff = await requireStaff();
  const { ids, status, notifyCustomer } = await parseJson(req, bulkSchema);
  const orders = await prisma.order.findMany({ where: { id: { in: ids } }, select: { id: true, orderNumber: true, status: true } });

  const updated: string[] = [];
  const skipped: Array<{ orderNumber: string; reason: string }> = [];
  for (const o of orders) {
    if (o.status === status) {
      skipped.push({ orderNumber: o.orderNumber, reason: "Already at this step" });
      continue;
    }
    try {
      await updateOrderByStaff(o.id, staff.name, { status, notifyCustomer });
      updated.push(o.orderNumber);
    } catch (err) {
      skipped.push({ orderNumber: o.orderNumber, reason: err instanceof Error ? err.message : "Could not update" });
    }
  }
  await audit(staff.id, "order.bulk.status", "Order", null, { status, updated });
  return ok({ updated: updated.length, skipped });
});
