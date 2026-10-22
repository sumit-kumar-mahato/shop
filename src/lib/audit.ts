import "server-only";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/request";

/** Record an admin action. Never throws — auditing must not break the action itself. */
export async function audit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: Prisma.InputJsonValue,
) {
  try {
    await prisma.auditLog.create({
      data: { actorId, action, entity, entityId: entityId ?? null, details, ip: getClientIp(headers()) },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log", err);
  }
}
