import { z } from "zod";
import { ok, parseJson, requireUser, route } from "@/lib/api";
import { requestReturn } from "@/lib/orders";

const schema = z.object({ reason: z.string().trim().min(5, "Please tell us why you're returning the item").max(500) });

export const POST = route<{ params: { orderNumber: string } }>(async (req, { params }) => {
  const user = await requireUser();
  const { reason } = await parseJson(req, schema);
  await requestReturn(params.orderNumber, user.id, reason);
  return ok({ success: true });
});
