import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { categoryInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const input = await parseJson(req, categoryInputSchema);
  const category = await prisma.category.update({
    where: { id: params.id },
    data: { ...input, image: input.image ?? null, gender: input.gender ?? null },
  });
  await audit(staff.id, "category.update", "Category", category.id, { name: category.name });
  return ok({ category });
});

export const DELETE = route(async (_req, { params }) => {
  const staff = await requireStaff();
  // Products in this category stay in the catalog, just without a category.
  const category = await prisma.category.delete({ where: { id: params.id } });
  await audit(staff.id, "category.delete", "Category", category.id, { name: category.name });
  return ok({ success: true });
});
