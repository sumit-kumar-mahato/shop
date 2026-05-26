import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, gender, image } = body;

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        gender,
        image,
      },
    });

    return NextResponse.json(newCategory);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to create category" }, { status: 500 });
  }
}
