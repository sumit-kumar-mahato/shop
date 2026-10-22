import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { addressSchema } from "@/lib/validators";

async function ownAddress(id: string, userId: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new ApiError(404, "Address not found.");
  return address;
}

export const PATCH = route(async (req, { params }) => {
  const user = await requireUser();
  await ownAddress(params.id, user.id);
  const input = await parseJson(req, addressSchema);
  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.address.update({
      where: { id: params.id },
      data: { ...input, line2: input.line2 || null, landmark: input.landmark || null, isDefault: input.isDefault ?? undefined },
    });
  });
  return ok({ address });
});

export const DELETE = route(async (_req, { params }) => {
  const user = await requireUser();
  const address = await ownAddress(params.id, user.id);
  await prisma.address.delete({ where: { id: address.id } });
  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return ok({ success: true });
});
