import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE } from "@/lib/constants";

// First line of defence only: every protected page and API route also re-checks the session
// and role against the database on the server.
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const claims = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  const needsStaff = pathname === "/admin" || pathname.startsWith("/admin/");
  const needsUser = needsStaff || pathname.startsWith("/account") || pathname.startsWith("/checkout");

  if (needsUser && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (needsStaff && claims && claims.role === "CUSTOMER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  if (needsUser) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
