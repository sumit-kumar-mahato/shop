import { z } from "zod";
import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireStaff, route } from "@/lib/api";
import { productInputSchema } from "@/lib/admin-schemas";
import { audit } from "@/lib/audit";

export const PATCH = route(async (req, { params }) => {
  const staff = await requireStaff();
  const existing = await prisma.product.findUnique({ where: { id: params.id }, include: { variants: { select: { id: true } } } });
  if (!existing) throw new ApiError(404, "Product not found.");

  const { variants, ...input } = await parseJson(req, productInputSchema);
  const existingIds = new Set(existing.variants.map((v) => v.id));
  const keptIds = new Set(variants.map((v) => v.id).filter((id): id is string => Boolean(id && existingIds.has(id))));

  const product = await prisma.$transaction(async (tx) => {
    // Remove deleted variants first so a re-added size/color doesn't clash with the unique constraint.
    await tx.productVariant.deleteMany({ where: { productId: existing.id, id: { notIn: [...keptIds] } } });
    // Temporarily rename kept SKUs to avoid unique clashes when SKUs are swapped between rows.
    for (const id of keptIds) {
      await tx.productVariant.update({ where: { id }, data: { sku: `__tmp_${id}`, size: `__tmp_${id}`, color: `__tmp_${id}` } });
    }
    for (const [position, v] of variants.entries()) {
      const data = { sku: v.sku, size: v.size, color: v.color, colorHex: v.colorHex ?? null, stock: v.stock, price: v.price ?? null, isActive: v.isActive, position };
      if (v.id && keptIds.has(v.id)) {
        await tx.productVariant.update({ where: { id: v.id }, data });
      } else {
        await tx.productVariant.create({ data: { ...data, productId: existing.id } });
      }
    }
    return tx.product.update({
      where: { id: existing.id },
      data: { ...input, categoryId: input.categoryId || null, compareAtPrice: input.compareAtPrice || null },
    });
  }, { timeout: 30_000, maxWait: 10_000 });

  await audit(staff.id, "product.update", "Product", product.id, { title: product.title });
  return ok({ product });
});

const quickSchema = z.object({ status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]) });

/** Quick status change from the products list. */
export const PUT = route(async (req, { params }) => {
  const staff = await requireStaff();
  const { status } = await parseJson(req, quickSchema);
  const product = await prisma.product.update({ where: { id: params.id }, data: { status } });
  await audit(staff.id, "product.status", "Product", product.id, { status });
  return ok({ product });
});

export const DELETE = route(async (_req, { params }) => {
  const staff = await requireStaff();
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { _count: { select: { orderItems: true } } } });
  if (!product) throw new ApiError(404, "Product not found.");

  // Products that appear in orders are archived instead of deleted, to keep order history intact.
  if (product._count.orderItems > 0) {
    await prisma.product.update({ where: { id: product.id }, data: { status: "ARCHIVED" } });
    await audit(staff.id, "product.archive", "Product", product.id, { title: product.title });
    return ok({ archived: true });
  }
  await prisma.product.delete({ where: { id: product.id } });
  await audit(staff.id, "product.delete", "Product", product.id, { title: product.title });
  return ok({ deleted: true });
});
