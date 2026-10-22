import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { PREVIEW_HEADER, SESSION_COOKIE } from "@/lib/constants";

// First line of defence only: every protected page and API route also re-checks the session
// and role against the database on the server.
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const claims = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  // Admin live preview: flag the request so pages render unpublished drafts. The flag only takes
  // effect for signed-in staff — the server re-checks the session (see isPreviewRequest).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(PREVIEW_HEADER);
  if (request.nextUrl.searchParams.get("pkm_preview") === "1" && claims && claims.role !== "CUSTOMER") {
    requestHeaders.set(PREVIEW_HEADER, "1");
  }

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

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (needsUser || requestHeaders.has(PREVIEW_HEADER)) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    // Storefront pages opened from the admin live preview.
    { source: "/((?!api|_next/static|_next/image|favicon.ico).*)", has: [{ type: "query", key: "pkm_preview" }] },
  ],
};
