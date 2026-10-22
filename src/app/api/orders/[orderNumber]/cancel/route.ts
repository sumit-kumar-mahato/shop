import { z } from "zod";
import { ok, parseJson, requireUser, route } from "@/lib/api";
import { cancelOrderByCustomer } from "@/lib/orders";

const schema = z.object({ reason: z.string().trim().max(300).nullable().optional() });

export const POST = route<{ params: { orderNumber: string } }>(async (req, { params }) => {
  const user = await requireUser();
  const { reason } = await parseJson(req, schema);
  await cancelOrderByCustomer(params.orderNumber, user.id, reason ?? null);
  return ok({ success: true });
});
