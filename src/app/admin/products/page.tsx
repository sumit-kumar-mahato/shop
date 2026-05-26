import React from "react";
import { prisma } from "@/lib/db";
import AdminProductsClient from "@/components/AdminProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products: any[] = [];
  let categories: any[] = [];

  try {
    // 1. Fetch categories
    categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    // 2. Fetch all products
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Products loader error", e);
  }

  return <AdminProductsClient initialProducts={products} categories={categories} />;
}
