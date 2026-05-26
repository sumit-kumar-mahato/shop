import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Failed to update configuration" }, { status: 500 });
  }
}
