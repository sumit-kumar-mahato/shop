import React from "react";
import { prisma } from "@/lib/db";
import AdminOrdersClient from "@/components/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Orders loader error", e);
  }

  return <AdminOrdersClient initialOrders={orders} />;
}
