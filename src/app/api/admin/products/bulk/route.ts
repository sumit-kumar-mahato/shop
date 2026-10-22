import { z } from "zod";
import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { audit } from "@/lib/audit";
import { PRODUCT_FLAGS } from "@/lib/constants";

const bulkSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), ids: z.array(z.string().min(1)).min(1).max(200), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]) }),
  z.object({ action: z.literal("flag"), ids: z.array(z.string().min(1)).min(1).max(200), flag: z.enum(Object.keys(PRODUCT_FLAGS) as [keyof typeof PRODUCT_FLAGS, ...Array<keyof typeof PRODUCT_FLAGS>]), value: z.boolean() }),
]);

/** Change the status or a homepage placement flag of many products at once. */
export const POST = route(async (req) => {
  const staff = await requireStaff();
  const input = await parseJson(req, bulkSchema);
  const data = input.action === "status" ? { status: input.status } : { [input.flag]: input.value };
  const { count } = await prisma.product.updateMany({ where: { id: { in: input.ids } }, data });
  await audit(staff.id, `product.bulk.${input.action}`, "Product", null, { count, ...(input.action === "status" ? { status: input.status } : { flag: input.flag, value: input.value }) });
  return ok({ count });
});
