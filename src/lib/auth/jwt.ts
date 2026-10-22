// Edge-compatible session token signing (used by both middleware and server code).
import { SignJWT, jwtVerify } from "jose";

export type SessionClaims = {
  sid: string; // Session row id
  uid: string; // User id
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set (32+ characters) in production.");
  }
  return new TextEncoder().encode("dev-only-insecure-secret-change-me-before-deploying!!");
}

export async function signSessionToken(claims: SessionClaims, expiresAt: Date): Promise<string> {
  return new SignJWT({ sid: claims.sid, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.uid)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sid !== "string" || typeof payload.sub !== "string") return null;
    const role = payload.role;
    if (role !== "CUSTOMER" && role !== "STAFF" && role !== "ADMIN") return null;
    return { sid: payload.sid, uid: payload.sub, role };
  } catch {
    return null;
  }
}
