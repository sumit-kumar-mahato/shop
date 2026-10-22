import { prisma } from "@/lib/db";
import { ApiError, ok, parseJson, requireUser, route } from "@/lib/api";
import { addressSchema } from "@/lib/validators";

const MAX_ADDRESSES = 10;

export const GET = route(async () => {
  const user = await requireUser();
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return ok({ addresses });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, addressSchema);
  const count = await prisma.address.count({ where: { userId: user.id } });
  if (count >= MAX_ADDRESSES) throw new ApiError(400, `You can save up to ${MAX_ADDRESSES} addresses.`);

  const makeDefault = input.isDefault || count === 0;
  const address = await prisma.$transaction(async (tx) => {
    if (makeDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
    return tx.address.create({
      data: { ...input, line2: input.line2 || null, landmark: input.landmark || null, isDefault: makeDefault, userId: user.id },
    });
  });
  return ok({ address }, { status: 201 });
});
