import React from "react";
import { prisma } from "@/lib/db";
import AdminCategoriesClient from "@/components/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Categories loader error", e);
  }

  return <AdminCategoriesClient initialCategories={categories} />;
}
