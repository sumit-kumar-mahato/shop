import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { TokenType } from "@prisma/client";
import { prisma } from "@/lib/db";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Create a single-use token (email verification / password reset). Only the hash is stored. */
export async function createAuthToken(userId: string, type: TokenType, ttlMinutes: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  // Invalidate earlier tokens of the same type, and purge anything expired.
  await prisma.authToken.deleteMany({ where: { OR: [{ userId, type }, { expiresAt: { lt: new Date() } }] } });
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
    },
  });
  return token;
}

/** Validate and consume a token. Returns the userId on success. */
export async function consumeAuthToken(token: string, type: TokenType): Promise<string | null> {
  if (!token || token.length > 200) return null;
  const record = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) return null;
  const updated = await prisma.authToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  return updated.count === 1 ? record.userId : null;
}
