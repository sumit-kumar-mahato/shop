import { Prisma, PrismaClient } from "@prisma/client";

/** Postgres schema from DATABASE_URL (?schema=...). The store can live in its own schema, e.g. "store" on Supabase. */
export const DB_SCHEMA = (() => {
  try {
    const schema = new URL(process.env.DATABASE_URL ?? "").searchParams.get("schema") || "public";
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(schema) ? schema : "public";
  } catch {
    return "public";
  }
})();

/** Schema-qualified table name for raw SQL (Prisma's own queries are qualified automatically). */
export function table(name: "Order" | "RateLimit") {
  return Prisma.raw(`"${DB_SCHEMA}"."${name}"`);
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
