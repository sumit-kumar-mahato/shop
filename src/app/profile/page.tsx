import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { User, Gift, Award, ShoppingBag, MapPin, Share2, Clipboard } from "lucide-react";

// Helper to safely parse JSON strings
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default async function ProfilePage() {
  // 1. Fetch recent orders from DB (mocking the user is logged in, e.g. using a default customer email "guest@prabodhclothing.com" or returning all orders for a realistic showcase dashboard!)
  // Since we don't force a strict login wall immediately, we can load recent orders to demonstrate the complete order tracking & user history features visually!
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {}

  // Standard guest stats
  const totalSpend = orders.reduce((sum, order) => sum + order.finalTotal, 0);
  const totalOrders = orders.length;

  // Reward points calculation (1 point for every 10 INR spent)
  const rewardPoints = Math.floor(totalSpend / 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-luxury-200/40 dark:border-zinc-800/40 pb-6 mb-10 text-center lg:text-left">
        <h1 className="serif-header text-3xl uppercase tracking-wide">Client Account</h1>
        <p className="text-xs text-luxury-500 font-light mt-1">
          Welcome back to the Prabodh Kumar Mahato Society. View order tracking status and reward points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info Card */}
        <div className="space-y-6 lg:border-r lg:border-luxury-200/50 lg:dark:border-zinc-800/50 lg:pr-8">
          <div className="bg-luxury-100/60 dark:bg-zinc-900 border border-luxury-200/40 dark:border-zinc-800/40 p-6 rounded-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-luxury-900 text-white dark:bg-luxury-gold dark:text-zinc-950 flex items-center justify-center mx-auto shadow-sm">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Guest Client</h3>
              <p className="text-[11px] text-luxury-500 font-mono mt-0.5">guest@prabodhclothing.com</p>
            </div>
            <div className="pt-2 border-t border-luxury-200/60 dark:border-zinc-800/40 text-xs font-light text-left space-y-2.5">
              <p className="flex items-center gap-2"><MapPin size={13} className="text-luxury-gold" /> New Delhi, India</p>
              <p className="flex items-center gap-2"><ShoppingBag size={13} className="text-luxury-gold" /> {totalOrders} Completed Orders</p>
            </div>
          </div>

          {/* Reward Points Box */}
          <div className="bg-gradient-to-br from-luxury-900 to-zinc-950 text-white p-6 rounded-sm border border-luxury-800 shadow-md text-center space-y-3">
            <Award className="text-luxury-gold mx-auto" size={28} />
            <h4 className="text-xs font-bold tracking-widest uppercase text-luxury-gold">Member Privilege Points</h4>
            <p className="text-3xl font-bold font-mono text-white">{rewardPoints}</p>
            <p className="text-[10px] text-zinc-300 font-light leading-relaxed">
              You earn 1 Reward Point for every ₹10 spent. Redeem points for cash discounts on checkout.
            </p>
          </div>
        </div>

        {/* Orders Listing & Referrals */}
        <div className="lg:col-span-3 space-y-10">
          {/* Referrals Section */}
          <div className="bg-luxury-100 dark:bg-zinc-900/30 border border-luxury-200/50 dark:border-zinc-800 p-6 rounded-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <span className="text-[9px] bg-luxury-gold/20 text-luxury-600 dark:text-luxury-gold px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                REFERRAL INCENTIVE
              </span>
              <h3 className="serif-header text-lg uppercase tracking-wide">Invite a Friend & Earn ₹100</h3>
              <p className="text-xs text-luxury-500 font-light leading-relaxed">
                Share your personalized code. Once your referral completes a transaction above ₹1500, we will credit 100 Reward Points directly to your member profile.
              </p>
            </div>
            <div>
              <div className="flex bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 rounded p-2 justify-between items-center text-xs font-mono text-luxury-600">
                <span className="font-bold truncate">AVG-REF-GUEST</span>
                <span title="Copy Referral Link" className="flex items-center">
                  <Clipboard size={14} className="text-luxury-gold cursor-pointer hover:scale-110 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          {/* Orders History List */}
          <div className="space-y-6">
            <h2 className="serif-header text-xl uppercase tracking-wider border-b border-luxury-200/40 dark:border-zinc-800/40 pb-3">
              Order Transactions
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-luxury-100/30 dark:bg-zinc-900/10 border border-dashed border-luxury-200 dark:border-zinc-800 rounded">
                <p className="text-xs text-luxury-500 font-light italic">No purchase transactions found in this profile.</p>
                <Link href="/shop" className="inline-block mt-4 bg-luxury-900 text-white text-xs font-bold px-6 py-2.5 rounded-sm uppercase tracking-widest">
                  SHOP NOW
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const items = safeParse(order.items);
                  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={order.id}
                      className="border border-luxury-200 dark:border-zinc-800 p-5 rounded-sm space-y-4 bg-white dark:bg-zinc-900 shadow-sm"
                    >
                      {/* Order top bar info */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-luxury-100 dark:border-zinc-800 pb-3 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold">
                            Order Number: <span className="font-mono text-luxury-gold uppercase">{order.orderNumber}</span>
                          </p>
                          <p className="text-luxury-400 font-light">Placed on {orderDate}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold">Value: ₹{order.finalTotal}</p>
                          <p className="text-[10px] text-zinc-400">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
                        </div>
                      </div>

                      {/* Purchased items list */}
                      <div className="space-y-2">
                        {items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-medium truncate max-w-xs">{item.title}</span>
                            <span className="text-luxury-500 font-light">
                              {item.size} / {item.color} &times; {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Visual Status Tracker Bar */}
                      <div className="pt-4 border-t border-luxury-100 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-luxury-500 uppercase tracking-widest mb-3">
                          Shipment Status: <span className="text-luxury-gold">{order.status}</span>
                        </p>

                        <div className="relative flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2">
                          <div className="flex flex-col items-center z-10">
                            <span className="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[8px] font-bold mb-1">
                              ✓
                            </span>
                            <span className="text-green-600 font-bold">Placed</span>
                          </div>
                          <div className="flex flex-col items-center z-10">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold mb-1 ${
                              ["Shipped", "Delivered"].includes(order.status) ? "bg-green-500 text-white" : "bg-luxury-200 dark:bg-zinc-800 text-zinc-400"
                            }`}>
                              {["Shipped", "Delivered"].includes(order.status) ? "✓" : "2"}
                            </span>
                            <span className={["Shipped", "Delivered"].includes(order.status) ? "text-green-600 font-bold" : ""}>Shipped</span>
                          </div>
                          <div className="flex flex-col items-center z-10">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold mb-1 ${
                              order.status === "Delivered" ? "bg-green-500 text-white" : "bg-luxury-200 dark:bg-zinc-800 text-zinc-400"
                            }`}>
                              {order.status === "Delivered" ? "✓" : "3"}
                            </span>
                            <span className={order.status === "Delivered" ? "text-green-600 font-bold" : ""}>Delivered</span>
                          </div>

                          {/* Tracker Bar Background Line */}
                          <div className="absolute top-2 left-4 right-4 h-0.5 bg-luxury-200 dark:bg-zinc-800 -z-0" />
                          <div
                            className="absolute top-2 left-4 h-0.5 bg-green-500 -z-0 transition-all duration-500"
                            style={{
                              width: order.status === "Delivered" ? "100%" : order.status === "Shipped" ? "50%" : "0%",
                            }}
                          />
                        </div>

                        {order.trackingNumber && (
                          <p className="text-[10px] text-zinc-400 mt-4 text-center font-mono uppercase">
                            Tracking Code: {order.trackingNumber} (Express Delivery)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
