import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness check used by the deploy workflow (.github/workflows/ci.yml) to confirm that a new
 * version is live and can reach the database. Reveals nothing beyond the public commit id.
 */
export async function GET() {
  let database = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "unreachable";
  }
  return NextResponse.json(
    { status: database === "ok" ? "ok" : "degraded", commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null, database },
    { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
