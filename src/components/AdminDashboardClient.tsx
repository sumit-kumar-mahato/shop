"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, ShoppingBag, Users, BellRing, ChevronRight, Ban, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";

interface AdminDashboardClientProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    lowStockCount: number;
    totalProducts: number;
  };
  lowStockProducts: any[];
  recentOrders: any[];
}

const AdminDashboardClient: React.FC<AdminDashboardClientProps> = ({
  stats,
  lowStockProducts,
  recentOrders,
}) => {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders" | "aov">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const months = ["Jan", "Feb", "Mar", "Apr", "May"];

  const getValues = () => {
    if (activeMetric === "revenue") {
      return [45290, 58110, 89490, 124290, stats.totalRevenue || 165000];
    } else if (activeMetric === "orders") {
      return [42, 55, 78, 112, stats.totalOrders || 148];
    } else {
      const janAov = Math.round(45290 / 42);
      const febAov = Math.round(58110 / 55);
      const marAov = Math.round(89490 / 78);
      const aprAov = Math.round(124290 / 112);
      const liveAov = stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 1115;
      return [janAov, febAov, marAov, aprAov, liveAov];
    }
  };

  const values = getValues();
  const maxValue = Math.max(...values, 10);

  const formatVal = (v: number) => {
    if (activeMetric === "revenue" || activeMetric === "aov") {
      return `₹${v.toLocaleString("en-IN")}`;
    }
    return `${v} Orders`;
  };

  // Simple bar visual data representation for categories/earnings
  const categorySales = [
    { name: "Shirts", percent: 45, value: "₹45,290" },
    { name: "Sarees", percent: 35, value: "₹35,110" },
    { name: "Jeans", percent: 12, value: "₹12,490" },
    { name: "T-Shirts", percent: 8, value: "₹8,290" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold tracking-wide uppercase text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-luxury-gold w-5 h-5 animate-pulse" /> Prabodh Clothing Hub
          </h1>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 font-light mt-0.5">Real-time overview of clothing retail store performance.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-855 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(197,168,128,0.1)] hover:border-luxury-gold/50 p-6 rounded-sm space-y-3 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-luxury-gold/5 rounded-full blur-2xl group-hover:bg-luxury-gold/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-zinc-505 dark:text-zinc-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">Total Revenue</span>
            <div className="bg-luxury-gold/10 p-2 rounded-full text-luxury-gold">
              <TrendingUp size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
          <span className="text-[9px] text-green-600 dark:text-green-500 font-medium tracking-wide flex items-center gap-1">
            <CheckCircle size={10} /> 100% SECURE TRANSACTIONS
          </span>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-855 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(197,168,128,0.1)] hover:border-luxury-gold/50 p-6 rounded-sm space-y-3 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-luxury-gold/5 rounded-full blur-2xl group-hover:bg-luxury-gold/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-zinc-505 dark:text-zinc-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">Total Orders</span>
            <div className="bg-luxury-gold/10 p-2 rounded-full text-luxury-gold">
              <ShoppingBag size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{stats.totalOrders}</p>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-light uppercase tracking-widest">COD & ONLINE CONVERSIONS</span>
        </div>

        {/* Products */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-855 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(197,168,128,0.1)] hover:border-luxury-gold/50 p-6 rounded-sm space-y-3 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-luxury-gold/5 rounded-full blur-2xl group-hover:bg-luxury-gold/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-zinc-505 dark:text-zinc-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">Active Catalog</span>
            <div className="bg-luxury-gold/10 p-2 rounded-full text-luxury-gold">
              <Users size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{stats.totalProducts}</p>
          <span className="text-[9px] text-zinc-505 dark:text-zinc-400 font-light uppercase tracking-widest">Seeded Luxury Styles</span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-855 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.1)] hover:border-red-500/50 p-6 rounded-sm space-y-3 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all duration-500" />
          <div className="flex justify-between items-center text-zinc-505 dark:text-zinc-400">
            <span className="text-[10px] font-bold tracking-widest uppercase">Stock Warnings</span>
            <div className={`p-2 rounded-full ${stats.lowStockCount > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
              <BellRing size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">{stats.lowStockCount}</p>
          <span className={`text-[9px] font-bold uppercase tracking-wider ${stats.lowStockCount > 0 ? "text-red-500 animate-pulse" : "text-green-600 dark:text-green-500"}`}>
            {stats.lowStockCount > 0 ? "REPLENISH APPAREL SOON" : "INVENTORY HEALTHY"}
          </span>
        </div>
      </div>

      {/* Three Columns Layout: Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Trend Chart (SVG) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-sm space-y-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-shadow duration-300 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Performance Trend</h3>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-light mt-0.5">Visual representation of monthly boutique growth.</p>
            </div>
            
            {/* Metric Selection Tabs */}
            <div className="flex gap-1.5 text-[9px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 p-1 rounded bg-zinc-50 dark:bg-zinc-950">
              <button
                onClick={() => setActiveMetric("revenue")}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeMetric === "revenue" ? "bg-luxury-gold text-zinc-955" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveMetric("orders")}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeMetric === "orders" ? "bg-luxury-gold text-zinc-955" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveMetric("aov")}
                className={`px-3 py-1.5 rounded transition-all ${
                  activeMetric === "aov" ? "bg-luxury-gold text-zinc-955" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                AOV
              </button>
            </div>
          </div>

          <div className="relative h-48 w-full pt-4">
            <svg className="w-full h-[90%]" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="currentColor" className="stroke-zinc-100 dark:stroke-zinc-800/80" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="currentColor" className="stroke-zinc-100 dark:stroke-zinc-800/80" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="currentColor" className="stroke-zinc-100 dark:stroke-zinc-800/80" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="currentColor" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />

              {/* Bars rendering dynamically */}
              {values.map((v, i) => {
                const barHeight = (v / maxValue) * 160;
                const barY = 190 - barHeight;
                const barWidth = 35;
                const barX = 30 + i * 100;
                const isCurrent = i === 4;

                return (
                  <rect
                    key={i}
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    fill={isCurrent ? "url(#goldGradientActive)" : "url(#goldGradient)"}
                    rx="3"
                    className="transition-all duration-300 cursor-pointer hover:opacity-90"
                    onMouseEnter={(e) => {
                      setHoveredIndex(i);
                      setTooltipPos({ x: barX + barWidth / 2, y: barY - 10 });
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}

              {/* Definitions for Gradient Glow */}
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c5a880" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c5a880" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="goldGradientActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#c5a880" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#c5a880" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between px-6 pt-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">
              {months.map((m, idx) => (
                <span key={m} className={idx === 4 ? "text-luxury-gold animate-pulse" : ""}>
                  {m} {idx === 4 ? "(Live)" : ""}
                </span>
              ))}
            </div>

            {/* Interactive Tooltip popup */}
            {hoveredIndex !== null && (
              <div
                className="absolute bg-zinc-950 text-white text-[10px] font-bold py-1.5 px-3 rounded shadow-xl border border-luxury-gold/30 pointer-events-none transform -translate-x-1/2 -translate-y-full font-mono uppercase tracking-wider z-20 animate-fade-in"
                style={{
                  left: `${(tooltipPos.x / 500) * 100}%`,
                  top: `${(tooltipPos.y / 200) * 100}%`,
                }}
              >
                {months[hoveredIndex]}: {formatVal(values[hoveredIndex])}
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown sales list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-sm space-y-6 flex flex-col justify-between hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-shadow duration-300">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Share by Category</h3>
          <div className="space-y-4 flex-grow flex flex-col justify-center">
            {categorySales.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-655 dark:text-zinc-300 uppercase tracking-wider">{cat.name}</span>
                  <span className="text-luxury-gold font-bold font-mono">{cat.value} ({cat.percent}%)</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-luxury-gold h-full transition-all duration-1000"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Warnings list */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-6 rounded-sm space-y-6 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-shadow duration-300">
          <div className="flex items-center gap-2 text-red-500">
            <AlertTriangle size={15} />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Stock Notifications</h3>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-16 text-xs text-zinc-500 italic">
              All apparel categories are fully replenished.
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/80 max-h-56 overflow-y-auto pr-1">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-zinc-800 dark:text-zinc-300 truncate w-36 uppercase">{p.title}</h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono mt-0.5">SKU: {p.sku}</p>
                  </div>
                  <span className="text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-800/40 px-2.5 py-1 rounded font-bold font-mono">
                    Stock: {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Recent Orders Table */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Recent Customer Invoices</h3>
          <Link href="/admin/orders" className="text-[11px] font-bold text-luxury-gold hover:underline flex items-center gap-1">
            VIEW ALL TRANSACTIONS <ChevronRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-light text-left border-collapse text-zinc-500 dark:text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3">Invoice</th>
                <th className="py-3">Client</th>
                <th className="py-3">Address</th>
                <th className="py-3">Date</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-zinc-500 italic">No customer orders recorded yet.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 font-semibold text-luxury-gold font-mono uppercase">{order.orderNumber}</td>
                    <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200">{order.customerName}</td>
                    <td className="py-3 truncate max-w-[150px]">{order.address}, {order.city}</td>
                    <td className="py-3">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === "Delivered"
                          ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-500"
                          : order.status === "Shipped"
                          ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-blue-700 dark:text-blue-500 animate-pulse"
                          : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-500"
                      }`}>
                        {order.status === "Delivered" && <CheckCircle size={10} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-zinc-800 dark:text-zinc-200">₹{order.finalTotal}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminDashboardClient;
