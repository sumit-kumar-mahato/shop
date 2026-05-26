import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      title,
      sku,
      description,
      price,
      compareAtPrice,
      stock,
      gender,
      categoryName,
      images,
      colors,
      sizes,
      fabric,
      fit,
    } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        sku,
        description: description || "",
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock) || 0,
        gender,
        categoryName,
        images,
        colors,
        sizes,
        fabric: fabric || "Cotton",
        fit: fit || "Regular",
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update product" }, { status: 500 });
  }
}
