import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { categoryInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const POST = route(async (req) => {
  const staff = await requireStaff();
  const input = await parseJson(req, categoryInputSchema);
  const category = await prisma.category.create({ data: { ...input, image: input.image ?? null, gender: input.gender ?? null } });
  await audit(staff.id, "category.create", "Category", category.id, { name: category.name });
  return ok({ category }, { status: 201 });
});
