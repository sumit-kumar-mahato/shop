import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("admin_token")?.value;
  const isAuthenticated = token === "authenticated-session-token";

  // Protect all /admin routes
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      // If already logged in, redirect away from login page to dashboard
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } else {
      // If not logged in, redirect to login page
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  return NextResponse.next();
}

// Only match /admin and subroutes
export const config = {
  matcher: ["/admin/:path*"],
};
