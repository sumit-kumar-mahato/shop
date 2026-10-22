import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Read credentials from environment variables
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    // In production, we strictly require credentials to be set in environment variables.
    // If not set, we do not fall back to default values to prevent unauthorized access.
    if (process.env.NODE_ENV === "production" && (!expectedUsername || !expectedPassword)) {
      console.error("ADMIN_USERNAME or ADMIN_PASSWORD environment variable is not defined in production!");
      return NextResponse.json(
        { success: false, error: "Administrative access is not configured on this server." },
        { status: 500 }
      );
    }

    // Default credentials for local development if not configured
    const devUsername = expectedUsername || "admin";
    const devPassword = expectedPassword || "admin";

    if (username === devUsername && password === devPassword) {
      // Set secure HTTP-only cookie
      cookies().set("admin_token", "authenticated-session-token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
