import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, rating, comment, productId } = body;

    const newReview = await prisma.review.create({
      data: {
        customerName,
        customerEmail,
        rating: parseInt(rating),
        comment,
        productId,
        approved: true, // Auto-approved for this visual demo, but can be toggled by the admin later
      },
    });

    // Recalculate product overall rating
    const allReviews = await prisma.review.findMany({
      where: { productId, approved: true },
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
      },
    });

    return NextResponse.json(newReview);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to submit review" }, { status: 500 });
  }
}
