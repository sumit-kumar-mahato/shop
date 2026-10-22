import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type z, type ZodTypeAny } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser, isStaff, type CurrentUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

export class ApiError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/**
 * Wraps a route handler with: same-origin (CSRF) check for mutations, consistent JSON errors,
 * and safe error messages (internal details are logged, never sent to the browser).
 */
export function route<C = { params: Record<string, string> }>(handler: Handler<C>, opts: { skipOriginCheck?: boolean } = {}) {
  return async (req: Request, ctx: C): Promise<Response> => {
    try {
      if (!opts.skipOriginCheck && req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Next.js signals redirects, notFound and dynamic rendering by throwing; those must propagate. */
function isNextControlFlow(err: unknown) {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && (digest === "DYNAMIC_SERVER_USAGE" || digest.startsWith("NEXT_"));
}

function toErrorResponse(err: unknown): Response {
  if (isNextControlFlow(err)) throw err;
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message, fields: err.fields }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    const first = err.issues[0];
    const label = first?.path.length ? `${first.path.join(".")}: ` : "";
    return NextResponse.json({ error: `${label}${first?.message ?? "Invalid input"}`, fields }, { status: 400 });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target) ? (err.meta?.target as string[]).join(", ") : "value";
      return NextResponse.json({ error: `That ${target} is already in use.` }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
  }
  console.error("[api] unhandled error", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      throw new ApiError(403, "Invalid request origin.");
    }
    if (originHost !== host) throw new ApiError(403, "Cross-site request blocked.");
    return;
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") throw new ApiError(403, "Cross-site request blocked.");
}

export async function parseJson<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
  return schema.parse(body);
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  return user;
}

export async function requireStaff(opts: { adminOnly?: boolean } = {}): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please sign in to continue.");
  if (!isStaff(user)) throw new ApiError(403, "You do not have access to this area.");
  if (opts.adminOnly && user.role !== "ADMIN") throw new ApiError(403, "Only administrators can do this.");
  return user;
}

export async function limitByIp(req: Request, bucket: string, limit: number, windowSeconds: number) {
  const ip = getClientIp(req.headers) ?? "unknown";
  const result = await rateLimit(`${bucket}:ip:${ip}`, limit, windowSeconds);
  if (!result.ok) {
    throw new ApiError(429, `Too many attempts. Please try again in ${Math.ceil(result.retryAfter / 60)} minute(s).`);
  }
}
