import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
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

    const newProduct = await prisma.product.create({
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
        tags: JSON.stringify([categoryName.toLowerCase(), gender.toLowerCase()]),
        rating: 5.0,
      },
    });

    return NextResponse.json(newProduct);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to create product" }, { status: 500 });
  }
}
