import { prisma } from "@/lib/db";
import { ok, parseJson, requireStaff, route } from "@/lib/api";
import { productInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const POST = route(async (req) => {
  const staff = await requireStaff();
  const { variants, ...input } = await parseJson(req, productInputSchema);
  const product = await prisma.product.create({
    data: {
      ...input,
      categoryId: input.categoryId || null,
      compareAtPrice: input.compareAtPrice || null,
      variants: {
        create: variants.map(({ id: _id, ...v }, position) => ({ ...v, colorHex: v.colorHex ?? null, price: v.price ?? null, position })),
      },
    },
  });
  await audit(staff.id, "product.create", "Product", product.id, { title: product.title });
  return ok({ product }, { status: 201 });
});
