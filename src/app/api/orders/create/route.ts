import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      postalCode,
      total,
      gst,
      discount,
      finalTotal,
      paymentMethod,
      trackingNumber,
      items, // JSON string
    } = body;

    // 1. Create Order entry
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        address,
        city,
        postalCode,
        total: parseFloat(total),
        gst: parseFloat(gst),
        discount: parseFloat(discount),
        finalTotal: parseFloat(finalTotal),
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        trackingNumber,
        items,
        status: "Processing",
      },
    });

    // 2. Decrement product stock in inventory
    const parsedItems = JSON.parse(items);
    for (const item of parsedItems) {
      try {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: parseInt(item.quantity) || 1,
            },
          },
        });
      } catch (err) {
        console.error(`Failed to decrement stock for item ${item.productId}`, err);
      }
    }

    return NextResponse.json(newOrder);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to create order" }, { status: 500 });
  }
}
