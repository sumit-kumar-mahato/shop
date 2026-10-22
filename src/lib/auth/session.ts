import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";
import { signSessionToken, verifySessionToken } from "./jwt";
import { getClientIp } from "@/lib/request";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  emailVerified: boolean;
  sessionId: string;
};

const CUSTOMER_SESSION_DAYS = 30;
const STAFF_SESSION_DAYS = 7;

export async function createSession(user: { id: string; role: Role }) {
  const days = user.role === "CUSTOMER" ? CUSTOMER_SESSION_DAYS : STAFF_SESSION_DAYS;
  const expiresAt = new Date(Date.now() + days * 86_400_000);
  const h = headers();
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
      userAgent: h.get("user-agent")?.slice(0, 250) ?? null,
      ip: getClientIp(h),
    },
  });
  const token = await signSessionToken({ sid: session.id, uid: user.id, role: user.role }, expiresAt);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  // Opportunistic cleanup of expired sessions.
  await prisma.session.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } });
  return session;
}

export async function destroyCurrentSession() {
  const claims = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (claims) await prisma.session.deleteMany({ where: { id: claims.sid } });
  cookies().delete(SESSION_COOKIE);
}

/** Revoke every session of a user, optionally keeping one (e.g. the current one after a password change). */
export async function revokeUserSessions(userId: string, exceptSessionId?: string) {
  await prisma.session.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}

/** The logged-in user for this request, verified against the database. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const claims = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  const session = await prisma.session.findUnique({
    where: { id: claims.sid },
    include: { user: true },
  });
  if (!session || session.userId !== claims.uid || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    emailVerified: Boolean(u.emailVerifiedAt),
    sessionId: session.id,
  };
});

export function isStaff(user: Pick<CurrentUser, "role"> | null | undefined): boolean {
  return user?.role === "ADMIN" || user?.role === "STAFF";
}

/** For server components/pages: redirect to login when signed out. */
export async function requireUserPage(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** For admin pages. STAFF can access everything except areas marked adminOnly. */
export async function requireStaffPage(opts: { adminOnly?: boolean } = {}): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStaff(user)) redirect("/");
  if (opts.adminOnly && user.role !== "ADMIN") redirect("/admin");
  return user;
}
