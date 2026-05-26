import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        paymentStatus: status === "Delivered" ? "Paid" : undefined, // If delivered, automatically mark as paid
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update order status" }, { status: 500 });
  }
}
