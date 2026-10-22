import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Delete the admin_token cookie to clear the session
  cookies().delete("admin_token");
  return NextResponse.json({ success: true });
}
