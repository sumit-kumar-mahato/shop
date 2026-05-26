import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Check expiry
    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    // Check active flag
    if (!coupon.active) {
      return NextResponse.json({ error: "Coupon is inactive" }, { status: 400 });
    }

    // Check limit
    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to validate coupon" }, { status: 500 });
  }
}
