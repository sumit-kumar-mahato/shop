import React from "react";
import { prisma } from "@/lib/db";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    lowStockCount: 0,
    totalProducts: 0,
  };

  let lowStockProducts: any[] = [];
  let recentOrders: any[] = [];

  try {
    // 1. Fetch Orders details
    const orders = await prisma.order.findMany();
    stats.totalRevenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    stats.totalOrders = orders.length;

    recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 2. Fetch Products
    const products = await prisma.product.findMany();
    stats.totalProducts = products.length;

    lowStockProducts = products.filter((p) => p.stock <= 5);
    stats.lowStockCount = lowStockProducts.length;
  } catch (e) {
    console.error("Dashboard fetching failure", e);
  }

  return (
    <AdminDashboardClient
      stats={stats}
      lowStockProducts={lowStockProducts}
      recentOrders={recentOrders}
    />
  );
}
