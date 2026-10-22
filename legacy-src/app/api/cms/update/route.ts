import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const updatedConfig = await prisma.cmsConfig.upsert({
      where: { key: "store_settings" },
      update: {
        value: JSON.stringify(body),
      },
      create: {
        key: "store_settings",
        value: JSON.stringify(body),
      },
    });

    // Clear Next.js caching layers so changes propagate instantly on refresh
    revalidatePath("/");
    revalidatePath("/admin");

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update configuration" }, { status: 500 });
  }
}
