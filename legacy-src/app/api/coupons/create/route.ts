import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, value, expiryDate, usageLimit } = body;

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        value: parseFloat(value),
        expiryDate: new Date(expiryDate),
        usageLimit: parseInt(usageLimit) || 100,
      },
    });

    return NextResponse.json(newCoupon);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to create coupon" }, { status: 500 });
  }
}
