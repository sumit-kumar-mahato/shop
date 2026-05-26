import React from "react";
import { prisma } from "@/lib/db";
import AdminCouponsClient from "@/components/AdminCouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  let coupons: any[] = [];
  try {
    coupons = await prisma.coupon.findMany({
      orderBy: { expiryDate: "asc" },
    });
  } catch (e) {
    console.error("Coupons loader error", e);
  }

  return <AdminCouponsClient initialCoupons={coupons} />;
}
